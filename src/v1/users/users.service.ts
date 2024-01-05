import prisma from '@lib/prisma';
import { Prisma } from '@prisma/client';
import { hashPassword } from 'v1/auth/auth.service';

export const createUser = async (user: Prisma.UserCreateInput) => {
  user.password = await hashPassword(user.password);

  return await prisma.user.create({
    data: user,
    select: {
      id: true,
      nickname: true,
      publicKey: true,
    },
  });
};

export const getUser = async (userId: string) => {
  return await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
};
