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
router.put('/update-key-pair', validate(UpdateKeyPairSchema), updateKeyPairs);
router.get('/get-user/:userId', validate(GetUserSchema), getUser);
router.get(
  '/get-user-password-salt/:userId',
  validate(GetUserSchema),
  getUserPasswordSalt
);

export default router;
