import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/prisma.js";

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.ADMIN_PASSWORD ?? "Admin@12345";

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { name: "Mentor", email, passwordHash: await bcrypt.hash(password, 10), role: "ADMIN" },
  });
  console.log(`Admin ready: ${email}`);
}

main().finally(() => prisma.$disconnect());
