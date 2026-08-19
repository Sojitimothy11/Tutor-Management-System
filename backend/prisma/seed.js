require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const ADMIN_EMAIL = "admin@tms.local";
const ADMIN_PASSWORD = "Admin@12345";

async function main() {
  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      name: "System Administrator",
      email: ADMIN_EMAIL,
      password: hashed,
      role: "ADMIN",
    },
  });
  console.log(`Admin user ready: ${admin.email} (password: ${ADMIN_PASSWORD})`);

  const department = await prisma.department.upsert({
    where: { name: "General Studies" },
    update: {},
    create: { name: "General Studies", description: "Default department seeded for local development" },
  });
  console.log(`Department ready: ${department.name}`);

  const subject = await prisma.subject.upsert({
    where: { code: "GEN101" },
    update: {},
    create: { name: "Introduction to Studies", code: "GEN101", departmentId: department.id },
  });
  console.log(`Subject ready: ${subject.name} (${subject.code})`);

  console.log("\nSeed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
