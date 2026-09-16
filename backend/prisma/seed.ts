import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 8);

  await prisma.admin.create({
    data: {
      email: 'admin@system.com',
      password: passwordHash,
      mustChangePassword: true,
    },
  });
  console.log('Admin seed criado com sucesso.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
