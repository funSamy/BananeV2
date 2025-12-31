import { Database } from 'bun:sqlite';
import { PrismaBunSqlite } from 'prisma-adapter-bun-sqlite';
import { PrismaClient } from './generated/prisma/client';
import path from 'node:path';

// Configuration
const CHUNK_SIZE = 100;
const OLD_DB_PATH = path.join(process.cwd(), '..', 'bananesdb.db');
const EXPENDITURE_NAME = 'Dette';

interface OldProductionRow {
  id: number;
  date: string;
  dette: number;
  achats: number;
  produits: number;
  restes: number;
  stocks: number;
  ventes: number;
}

interface ProductionDataInput {
  date: Date;
  purchased: number;
  produced: number;
  stock: number;
  sales: number;
  remains: number;
}

interface ExpenditureInput {
  name: string;
  amount: number;
  productionDate: Date;
}

// Helper function to parse date from DD/MM/YYYY format
function parseDate(dateString: string): Date | null {
  // Try DD/MM/YYYY format first
  const ddmmyyyyMatch = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (ddmmyyyyMatch) {
    const [, day, month, year] = ddmmyyyyMatch;
    const date = new Date(
      parseInt(year, 10),
      parseInt(month, 10) - 1,
      parseInt(day, 10),
    );
    // Validate the date
    if (
      date.getFullYear() === parseInt(year, 10) &&
      date.getMonth() === parseInt(month, 10) - 1 &&
      date.getDate() === parseInt(day, 10)
    ) {
      return date;
    }
  }

  // Fallback to standard Date parsing
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    return date;
  }

  return null;
}

// Helper function to convert value to integer (handles string and number)
function toInt(value: string | number | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }
  if (typeof value === 'number') {
    return Math.floor(value);
  }
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

async function main() {
  console.log('🚀 Starting migration from old database to Prisma schema...\n');

  // Connect to old database
  console.log(`📂 Connecting to old database: ${OLD_DB_PATH}`);
  const oldDb = new Database(OLD_DB_PATH);

  // Check if table exists
  const tableCheck = oldDb
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='gestion_de_stock'",
    )
    .get() as { name: string } | undefined;

  if (!tableCheck) {
    console.error('❌ Table "gestion_de_stock" not found in old database');
    oldDb.close();
    process.exit(1);
  }

  // Get total count
  const totalCount = oldDb
    .prepare('SELECT COUNT(*) as count FROM gestion_de_stock')
    .get() as { count: number };

  console.log(`📊 Total rows to migrate: ${totalCount.count}\n`);

  if (totalCount.count === 0) {
    console.log('✅ No data to migrate');
    oldDb.close();
    return;
  }

  // Connect to new Prisma database
  const dbPath = process.env.DATABASE_URL
    ? process.env.DATABASE_URL
    : `file:${path.join(process.cwd(), 'prisma', 'dev.db')}`;

  console.log(`📂 Connecting to new Prisma database: ${dbPath}`);
  const prisma = new PrismaClient({
    adapter: new PrismaBunSqlite({
      url: dbPath,
    }),
    errorFormat: 'pretty',
    transactionOptions: {
      maxWait: 120_000,
      timeout: 300_000,
    },
  });

  try {
    // Prepare query for chunked reading
    const selectQuery = oldDb.prepare(`
      SELECT id, date, dette, achats, produits, restes, stocks, ventes
      FROM gestion_de_stock
      ORDER BY id
      LIMIT ? OFFSET ?
    `);

    let offset = 0;
    let totalProcessed = 0;
    let totalSkipped = 0;
    let chunkNumber = 0;

    console.log(`📦 Processing data in chunks of ${CHUNK_SIZE} rows...\n`);

    while (true) {
      chunkNumber++;
      const chunk = selectQuery.all(CHUNK_SIZE, offset) as OldProductionRow[];

      if (chunk.length === 0) {
        break;
      }

      console.log(
        `\n📦 Processing chunk ${chunkNumber} (rows ${offset + 1} to ${offset + chunk.length})...`,
      );

      // Prepare data for batch insert
      const productionDataBatch: ProductionDataInput[] = [];
      const expenditureBatch: ExpenditureInput[] = [];

      for (const row of chunk) {
        // Validate and parse date
        const date = parseDate(row.date);
        if (!date) {
          console.warn(
            `⚠️  Skipping row ${row.id}: Invalid date "${row.date}"`,
          );
          totalSkipped++;
          continue;
        }

        // Map old fields to new schema (convert to integers)
        const productionData: ProductionDataInput = {
          date,
          purchased: toInt(row.achats),
          produced: toInt(row.produits),
          stock: toInt(row.stocks),
          sales: toInt(row.ventes),
          remains: toInt(row.restes),
        };

        productionDataBatch.push(productionData);

        // If dette > 0, create expenditure entry
        const detteAmount = toInt(row.dette);
        if (detteAmount > 0) {
          expenditureBatch.push({
            name: EXPENDITURE_NAME,
            amount: detteAmount,
            productionDate: date,
          });
        }
      }

      // Insert data in transaction
      try {
        await prisma.$transaction(async (tx) => {
          // Insert production data
          if (productionDataBatch.length > 0) {
            // First, deduplicate within the batch itself (keep first occurrence)
            const seenDates = new Set<number>();
            const deduplicatedBatch = productionDataBatch.filter((data) => {
              const dateKey = data.date.getTime();
              if (seenDates.has(dateKey)) {
                return false;
              }
              seenDates.add(dateKey);
              return true;
            });

            // Check for existing dates in database to avoid duplicates
            const datesToCheck = deduplicatedBatch.map((d) => d.date);
            const existingRecords = await tx.productionData.findMany({
              where: {
                date: {
                  in: datesToCheck,
                },
              },
              select: {
                date: true,
              },
            });

            // Create a set of existing dates for quick lookup
            const existingDates = new Set(
              existingRecords.map((record) => record.date.getTime()),
            );

            // Filter out duplicates that exist in database
            const newProductionData = deduplicatedBatch.filter(
              (data) => !existingDates.has(data.date.getTime()),
            );

            let result = { count: 0 };
            if (newProductionData.length > 0) {
              result = await tx.productionData.createMany({
                data: newProductionData,
              });
            }
            const skipped =
              productionDataBatch.length - newProductionData.length;
            if (skipped > 0) {
              console.log(
                `  ⚠️  Skipped ${skipped} duplicate production data records`,
              );
            }
            console.log(
              `  ✅ Inserted ${result.count} production data records`,
            );
          }

          // For expenditures, we need to find the production data IDs first
          // since we need productionId for the expenditure
          if (expenditureBatch.length > 0) {
            // Get all unique dates from expenditure batch
            const dates = [
              ...new Set(expenditureBatch.map((exp) => exp.productionDate)),
            ];

            // Query all production data for these dates at once
            const productionDataRecords = await tx.productionData.findMany({
              where: {
                date: {
                  in: dates,
                },
              },
              select: {
                id: true,
                date: true,
              },
            });

            // Create a map of date -> productionId for quick lookup
            const dateToIdMap = new Map(
              productionDataRecords.map((record) => [
                record.date.getTime(),
                record.id,
              ]),
            );

            // Build expenditure inserts
            const expenditureInserts = expenditureBatch
              .map((exp) => {
                const productionId = dateToIdMap.get(
                  exp.productionDate.getTime(),
                );
                if (productionId) {
                  return {
                    name: exp.name,
                    amount: exp.amount,
                    productionId,
                  };
                }
                return null;
              })
              .filter(
                (
                  item,
                ): item is {
                  name: string;
                  amount: number;
                  productionId: number;
                } => item !== null,
              );

            if (expenditureInserts.length > 0) {
              // Check for existing expenditures to avoid duplicates
              // We need to check by productionId, name, and amount combination
              const productionIds = [
                ...new Set(expenditureInserts.map((e) => e.productionId)),
              ];
              const existingExpenditures = await tx.expenditure.findMany({
                where: {
                  productionId: {
                    in: productionIds,
                  },
                  name: EXPENDITURE_NAME,
                },
                select: {
                  productionId: true,
                  name: true,
                  amount: true,
                },
              });

              // Create a set of existing expenditure keys (productionId-name-amount)
              const existingExpKeys = new Set(
                existingExpenditures.map(
                  (exp) => `${exp.productionId}-${exp.name}-${exp.amount}`,
                ),
              );

              // Filter out duplicates
              const newExpenditures = expenditureInserts.filter(
                (exp) =>
                  !existingExpKeys.has(
                    `${exp.productionId}-${exp.name}-${exp.amount}`,
                  ),
              );

              let expResult = { count: 0 };
              if (newExpenditures.length > 0) {
                expResult = await tx.expenditure.createMany({
                  data: newExpenditures,
                });
              }
              const skippedExp =
                expenditureInserts.length - newExpenditures.length;
              if (skippedExp > 0) {
                console.log(
                  `  ⚠️  Skipped ${skippedExp} duplicate expenditure records`,
                );
              }
              console.log(
                `  ✅ Inserted ${expResult.count} expenditure records`,
              );
            }
          }
        });

        totalProcessed += productionDataBatch.length;
        const percentage = ((totalProcessed / totalCount.count) * 100).toFixed(
          2,
        );
        console.log(
          `  📊 Progress: ${totalProcessed}/${totalCount.count} rows (${percentage}%)`,
        );
      } catch (error) {
        console.error(`❌ Error processing chunk ${chunkNumber}:`, error);
        throw error;
      }

      offset += CHUNK_SIZE;

      // Break if we got fewer rows than chunk size (last chunk)
      if (chunk.length < CHUNK_SIZE) {
        break;
      }
    }

    console.log('\n✅ Migration completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Total rows processed: ${totalProcessed}`);
    console.log(`   - Rows skipped: ${totalSkipped}`);
    console.log(`   - Chunks processed: ${chunkNumber}`);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    oldDb.close();
    await prisma.$disconnect();
    console.log('\n🔌 Database connections closed');
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
