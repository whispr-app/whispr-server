import prisma from '../src/lib/prisma';

const reset = async () => {
  await prisma.keyPair.deleteMany();
  await prisma.user.deleteMany();
  await prisma.token.deleteMany();
};

reset();
