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
    },
  });
};

export const updateKeyPair = async (
  userId: string,
  encryptedPrivateKey: string,
  publicKey: string
) => {
  return await prisma.keyPair.create({
    data: {
      encryptedPrivateKey,
      publicKey,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
};

export const getUser = async (userId: string) => {
  return await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      keyPair: true,
    },
  });
};
