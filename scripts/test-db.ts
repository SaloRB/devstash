import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Testing database connection...\n");

  // Count records in each table
  const [users, items, itemTypes, collections, tags] = await Promise.all([
    prisma.user.count(),
    prisma.item.count(),
    prisma.itemType.count(),
    prisma.collection.count(),
    prisma.tag.count(),
  ]);

  console.log("Table counts:");
  console.log(`  users:       ${users}`);
  console.log(`  items:       ${items}`);
  console.log(`  item_types:  ${itemTypes}`);
  console.log(`  collections: ${collections}`);
  console.log(`  tags:        ${tags}`);

  // Verify system item types were seeded
  const systemTypes = await prisma.itemType.findMany({
    where: { isSystem: true },
    orderBy: { name: "asc" },
  });

  console.log(`\nSystem item types (${systemTypes.length}):`);
  for (const type of systemTypes) {
    console.log(`  ${type.color}  ${type.name}  (${type.icon})`);
  }

  console.log("\nDatabase connection OK.");
}

main()
  .catch((e) => {
    console.error("Database test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
