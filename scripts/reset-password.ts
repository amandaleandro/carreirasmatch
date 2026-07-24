import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const email = "amandaleandrosoares@gmail.com";
  const newPasswordHash = await bcrypt.hash("12345678", 10);

  const updated = await prisma.user.upsert({
    where: { email },
    update: { passwordHash: newPasswordHash },
    create: {
      name: "Amanda Carmo",
      email,
      passwordHash: newPasswordHash,
      careerSegment: "career_pro",
    },
  });

  console.log("=== RESET SUCCESS ===");
  console.log("User Email:", updated.email);
  console.log("Password set to: 12345678");
}

main().catch(console.error).finally(() => prisma.$disconnect());
