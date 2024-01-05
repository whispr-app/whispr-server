import { NextFunction, Request, RequestHandler, Response } from 'express';
import prisma from '@lib/prisma';
import { GetUserSchema, RegisterSchema } from './users.schemas';
import * as usersService from './users.service';
import { AppError } from '@lib/exceptions';
import { generateUserToken } from 'v1/auth/auth.service';

export const register: RequestHandler = async (
  req: Request<unknown, unknown, RegisterSchema>,
  res: Response,
  next: NextFunction
) => {
  const { password, nickname, encryptedPrivateKey, publicKey } = req.body;

  const user = await usersService.createUser({
    password,
    nickname,
    encryptedPrivateKey,
    publicKey,
  });

  const token = await generateUserToken(user.id);

  res.status(201).json({
    id: user.id,
    nickname: user.nickname,
    publicKey: user.publicKey,
    token,
  });
};

export const getUser: RequestHandler<GetUserSchema> = async (
  req: Request<GetUserSchema>,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;

  // userId must be hex and 12 bytes long
  if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
    return next(new AppError('validation', 'Malformed User ID'));
  }

  const user = await usersService.getUser(userId);

  if (!user) {
    return next(new AppError('validation', 'Specified user was not found.'));
  }

  res.status(200).json({
    id: user.id,
    nickname: user.nickname,
    publicKey: user.publicKey,
  });
};
