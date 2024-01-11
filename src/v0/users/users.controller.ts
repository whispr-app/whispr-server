import { NextFunction, Request, RequestHandler, Response } from 'express';
import prisma from '@lib/prisma';
import {
  GetUserSchema,
  RegisterSchema,
  UpdateKeyPairSchema,
} from './users.schemas';
import * as usersService from './users.service';
import { AppError } from '@lib/exceptions';
import { generateUserToken } from 'v0/auth/auth.service';

export const register: RequestHandler = async (
  req: Request<unknown, unknown, RegisterSchema>,
  res: Response,
  next: NextFunction
) => {
  const { password, nickname, username } = req.body;

  const user = await usersService.createUser({
    password,
    nickname,
    username,
  });

  // TODO: Change to refresh once MVP is done
  const token = await generateUserToken(user.id, 'access');

  res.status(201).json({
    id: user.id,
    token,
  });
};

export const updateKeyPairs = async (
  req: Request<unknown, unknown, UpdateKeyPairSchema>,
  res: Response,
  next: NextFunction
) => {
  const { encryptedPrivateKey, publicKey } = req.body;

  const userId = req.session?.userId;

  if (!userId) return next(new AppError('unauthorised', 'No user ID provided'));

  const exitingKeyPair = await prisma.keyPair.findFirst({
    where: {
      userId,
    },
  });

  if (exitingKeyPair)
    return next(
      new AppError(
        'validation',
        'Specified user has already established key pair.'
      )
    );

  await usersService.updateKeyPair(userId, encryptedPrivateKey, publicKey);

  res.status(200).send();
};

export const getUser: RequestHandler<GetUserSchema> = async (
  req: Request<GetUserSchema>,
  res: Response,
  next: NextFunction
) => {
  const { username } = req.params;
  const user = await usersService.getUser(username);

  if (!user) {
    return next(new AppError('validation', 'Specified user was not found.'));
  }

  const sessionUserId = req.session?.userId;

  res.status(200).json({
    id: user.id,
    username: user.username,
    nickname: user.nickname,
    publicKey: user.keyPair?.publicKey,
    encryptedPrivateKey:
      sessionUserId === user.id && user.keyPair?.encryptedPrivateKey,
  });
};

export const getUserPasswordSalt: RequestHandler<GetUserSchema> = async (
  req: Request<GetUserSchema>,
  res: Response,
  next: NextFunction
) => {
  const { username } = req.params;

  const user = await usersService.getUser(username);

  if (!user) {
    return next(new AppError('validation', 'Specified user was not found.'));
  }

  res.status(200).json({
    salt: user.password.split(':')[1],
  });
};
