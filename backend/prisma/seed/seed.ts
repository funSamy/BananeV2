import { PrismaClient } from '@prisma/client';
// import { ProdSeedData } from './proData';

async function main() {
  const prisma = new PrismaClient({
    errorFormat: 'pretty',
    transactionOptions: {
      maxWait: 120_000, // Maximum wait time for a transaction
      // This can be adjusted based on your needs
      timeout: 300_000, // Set a timeout for transactions
    },
  });
  // const prodData = new ProdSeedData(prisma);

  // Clear existing data
  console.log('Clearing existing production data...');
  console.time('Clearing existing data');
  await prisma.expenditure.deleteMany({});
  await prisma.productionData.deleteMany({});
  console.timeEnd('Clearing existing data');
  console.log('Existing data cleared.');

  // console.time('Production data seeding');
  // await prodData.create(3_000);
  // console.timeEnd('Production data seeding');
  console.log('Production data seeded successfully');

  await prisma.$disconnect();
}

main().catch((err) => console.error(err));
