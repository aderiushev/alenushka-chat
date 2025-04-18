import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const doctors = await prisma.user.findMany({
    where: { role: 'doctor' },
  });

  for (const user of doctors) {
    await prisma.doctor.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        name: user.email.split('@')[0],
        imageUrl: '',
        externalUrl: '',
      },
    });
  }
}

main()
    .then(() => prisma.$disconnect())
    .catch((e) => {
      console.error(e);
      prisma.$disconnect();
      process.exit(1);
    });
