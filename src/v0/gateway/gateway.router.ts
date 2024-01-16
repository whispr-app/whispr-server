import express, { Request, Response } from 'express';
import { validate, validateWs } from '@lib/middleware';
import { gateway } from './gateway.controller';
const router = express.Router();

router.ws('/:token', gateway);

export default router;
