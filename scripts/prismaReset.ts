import prisma from '../src/lib/prisma';

const reset = async () => {
  await prisma.user.deleteMany();
};

reset();
