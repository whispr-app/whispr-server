import { hashPassword } from '@lib/password';
import prisma from '@lib/prisma';
import express, { Request, Response } from 'express';
const router = express.Router();

/**
 * @api {post} /users User creation
 * @apiName CreateUser
 * @apiVersion 1.0.0
 * @apiGroup Users
 *
 * @apiBody {String} password Plaintext password to be hashed
 * @apiBody {String} nickname Nickname of user
 *
 * @apiSuccess {String} id User's ID
 * @apiSuccess {String} nickname User's nickname
 * @apiSuccess {String} publicKey User's public key
 *
 * @apiError (Error 400 Bad Request) MissingRequiredFields One or more fields required are missing.
 * @apiError (Error 400 Bad Request) InvalidPassword Password must be base64 encoded.
 */
router.post('/', async (req: Request, res: Response) => {
  const { password, nickname, encryptedPrivateKey, publicKey } = req.body;

  if (!password || !nickname || !encryptedPrivateKey || !publicKey) {
    return res.status(400).json({
      error: 'MissingRequiredFields',
      message: 'One or more fields required are missing.',
    });
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      password: hashedPassword,
      nickname,
      encryptedPrivateKey,
      publicKey,
    },
  });

  res
    .status(201)
    .json({ id: user.id, nickname: user.nickname, publicKey: user.publicKey });
});

/**
 * @api {get} /users/:userId User fetching
 * @apiName GetUser
 * @apiVersion 1.0.0
 * @apiGroup Users
 *
 * @apiSuccess {String} id User's ID
 * @apiSuccess {String} nickname User's nickname
 * @apiSuccess {String} publicKey User's public key
 *
 * @apiError (Error 400 Bad Request) MissingRequiredFields One or more fields required are missing.
 * @apiError (Error 400 Bad Request) InvalidUserId Malformed user ID.
 * @apiError (Error 404 Not Found) UserNotFound Specified user was not found.
 */
router.get('/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({
      error: 'MissingRequiredFields',
      message: 'One or more fields required are missing.',
    });
  }

  // userId must be hex and 12 bytes long
  if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
    return res.status(400).json({
      error: 'InvalidUserId',
      message: 'Malformed user ID.',
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    return res.status(404).json({
      error: 'UserNotFound',
      message: 'Specified user was not found.',
    });
  }

  res
    .status(200)
    .json({ id: user.id, nickname: user.nickname, publicKey: user.publicKey });
});

export default router;
