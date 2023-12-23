import prisma from '@lib/prisma';
import express, { Request, Response } from 'express';
import { validate } from '@lib/middleware';
import { GetUserSchema, RegisterSchema } from './users.schemas';
import { getUser, register } from './users.controller';
const router = express.Router();

router.post('/register', validate(RegisterSchema), register);
router.get('/:userId', validate(GetUserSchema), getUser);

export default router;
