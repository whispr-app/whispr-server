import express, { Request, Response } from 'express';
import { validate } from '@lib/middleware';
import {
  GetUserSchema,
  RegisterSchema,
  UpdateKeyPairSchema,
} from './users.schemas';
import {
  getUser,
  getUserPasswordSalt,
  register,
  updateKeyPairs,
} from './users.controller';
const router = express.Router();

router.post('/register', validate(RegisterSchema), register);
router.patch('/update-key-pair', validate(UpdateKeyPairSchema), updateKeyPairs);
router.get('/get-user/:username', validate(GetUserSchema), getUser);
router.get(
  '/get-user-password-salt/:username',
  validate(GetUserSchema),
  getUserPasswordSalt
);

export default router;
