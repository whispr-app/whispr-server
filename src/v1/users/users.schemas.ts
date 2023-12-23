import { z } from 'zod';

// Registration
export const RegisterSchema = z.object({
  body: z.object({
    password: z.string(),
    nickname: z.string(),
    encryptedPrivateKey: z.string(),
    publicKey: z.string(),
  }),
});
export type RegisterSchema = z.infer<typeof RegisterSchema>['body'];

// Get user
export const GetUserSchema = z.object({
  params: z.object({
    userId: z.string(),
  }),
});
export type GetUserSchema = z.infer<typeof GetUserSchema>['params'];
