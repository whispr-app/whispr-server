import express, { Request, Response } from 'express';
import { validate } from '@lib/middleware';
import { SigninSchema } from './auth.schema';
import { signin, signout, signoutAll } from './auth.controller';
const router = express.Router();

router.post('/sign-in', validate(SigninSchema), signin);
router.post('/sign-out', signout);
router.post('/sign-out-all', signoutAll);

router.get('/verify-token/:token');

export default router;
