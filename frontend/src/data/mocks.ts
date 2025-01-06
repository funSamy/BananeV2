import { DataEntry } from "@/types/data";
import { addDays } from "date-fns";

/**
 * Generate a random integer between min and max (inclusive).
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Randomly pick a subset of expenditures from a predefined list.
 */
function generateExpenditures(
  min: number,
  max: number
): { name: string; amount: number }[] {
  const possibleExpenditures = [
    "Transport",
    "Labor",
    "Rent",
    "Taxes",
    "Marketing",
    "Misc",
    "Utilities",
    "Insurance",
    "Maintenance",
    "Raw Materials",
    "Equipment",
    "Training",
    "Software",
    "Office Supplies",
    "Cleaning",
    "Security",
  ];
  // Decide how many different expenditure items to pick (e.g., 1-3)
  const numberOfExpenditures = randomInt(0, possibleExpenditures.length);

  // Shuffle array and take first n elements
  const shuffled = [...possibleExpenditures]
    .sort(() => Math.random() - 0.5)
    .slice(0, numberOfExpenditures);

  return shuffled.map((name) => ({
    name,
    amount: randomInt(min, max),
  }));
}

/**
 * Generate an array of mock DataEntry objects.
 * @param count Number of entries to generate
 * @returns A list of DataEntry objects
 */
export function generateMockData(count: number = 10): DataEntry[] {
  const data: DataEntry[] = [];

  for (let i = 0; i < count; i++) {
    // For each day, let’s offset from "today" going backwards
    const date = addDays(new Date(), -i);

    // Randomly decide purchased, produced, etc.
    const purchased = randomInt(30_000, 150_000);
    const produced = randomInt(0, 120_000);

    // stock is the total on hand before sales
    const stock = purchased + produced;

    // sales should not exceed stock
    const sales = randomInt(0, Math.round(stock)); // e.g., up to 100% of stock

    // remains is what’s left after sales
    const remains = stock - sales;

    // Build the DataEntry object
    const entry: DataEntry = {
      id: (i + 1).toString(),
      date,
      purchased,
      produced,
      stock,
      sales,
      remains,
      expenditures: generateExpenditures(sales - 1_000, sales),
    };

    data.push(entry);
  }

  return data;
}
