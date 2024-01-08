import express, { Request, Response } from 'express';
import { validate } from '@lib/middleware';
import {
  GetUserSchema,
  RegisterSchema,
  UpdateKeyPairSchema,
} from './users.schemas';
import { getUser, register, updateKeyPairs } from './users.controller';
const router = express.Router();

router.post('/register', validate(RegisterSchema), register);
router.put('/update-key-pair', validate(UpdateKeyPairSchema), updateKeyPairs);
router.get('/:userId', validate(GetUserSchema), getUser);

export default router;
