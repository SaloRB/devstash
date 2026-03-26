import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";

const DEMO_EMAIL = "demo@devstash.io";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany({
    where: { email: { not: DEMO_EMAIL } },
    select: { id: true, email: true },
  });

  if (users.length === 0) {
    console.log("No non-demo users found. Nothing to delete.");
    return;
  }

  console.log(`Found ${users.length} user(s) to delete:`);
  for (const u of users) {
    console.log(`  ${u.email} (${u.id})`);
  }

  const emails = users.map((u) => u.email).filter(Boolean) as string[];

  // VerificationToken has no userId FK — delete by identifier (email)
  const { count: vtCount } = await prisma.verificationToken.deleteMany({
    where: { identifier: { in: emails } },
  });

  // Deleting users cascades: accounts, sessions, items, collections, itemTypes
  const { count: userCount } = await prisma.user.deleteMany({
    where: { email: { not: DEMO_EMAIL } },
  });

  console.log(`\nDeleted:`);
  console.log(`  verification_tokens: ${vtCount}`);
  console.log(`  users (+ cascaded content): ${userCount}`);
  console.log("\nDone. Demo user preserved.");
}

main()
  .catch((e) => {
    console.error("Script failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
