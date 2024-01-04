import * as crypto from 'crypto';
import z from 'zod';
import { InvalidTokenOptions, InvalidToken } from './exceptions';
import prisma from './prisma';

// export const privateSigningKey = crypto.randomBytes(256).toString('hex');

// TODO: REMOVE THIS ASAP
export const privateSigningKey =
  '46adffdd1a3dba07cfb54c0ddab1baa0d3c03376939ee712189e7b42aa1058a7e1f17a114047943ac526f543038ba06ba7f4080a04fdd4fdd78d6be4d3d8f03d8b72070e5d8c244a31910ed05635051f08fd3bcdfafa205c9bbb4c5e1614610c4d185d149e04679abf253cf771d2f318fda353aef7e6c2ceeba31f3f209c78e59825d41c8af89f30ae01098dee8a205ddd2575d8830490215388fbe8891367fb8c4247438dccad3567e3b46b929430bea565ccb329c64fbfed5e7d746c24ece9bbeb610b170c1053b5a2e49d8f45dba2f1802d4fbd3f6d360f450d63938182223bf330d66e1ddcc89acae06b9212f5b4a1cfd274e6e2f579499b0a6f7ffb74ce';

console.log(privateSigningKey);

export const TokenOptionsSchema = z.object({
  audience: z.string(),
  subject: z.string(),
  expiresIn: z.number(),
  identifier: z.optional(z.string()),
});

export type TokenOptions = z.infer<typeof TokenOptionsSchema>;

export const generateToken = async (options: TokenOptions) => {
  try {
    TokenOptionsSchema.parse(options);
  } catch (e) {
    if (e instanceof z.ZodError) {
      throw new InvalidTokenOptions();
    }
  }

  const { audience, subject, expiresIn, identifier } = options;

  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const payload = {
    iss: 'Whispr',
    aud: audience,
    sub: subject,
    exp: Date.now() + expiresIn,
    iat: Date.now(),
    jti: crypto.randomBytes(16).toString('hex'),
    ide: identifier,
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString(
    'base64url'
  );
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    'base64url'
  );

  const signature = crypto
    .createHmac('sha256', privateSigningKey)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  await prisma.token.create({
    data: {
      jti: payload.jti,
      userId: payload.sub,
    },
  });

  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

export const verifyToken = async (token: string) => {
  const [encodedHeader, encodedPayload, signature] = token.split('.');

  const header = JSON.parse(Buffer.from(encodedHeader, 'base64url').toString());
  const payload = JSON.parse(
    Buffer.from(encodedPayload, 'base64url').toString()
  );

  const calculatedSignature = crypto
    .createHmac('sha256', privateSigningKey)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  const tokenExists = prisma.token.findUnique({
    where: {
      jti: payload.jti,
    },
  });

  if (!tokenExists) {
    throw new InvalidToken('Token does not exist');
  }

  if (signature !== calculatedSignature) {
    throw new InvalidToken('Signature does not match');
  }

  if (payload.exp < Date.now()) {
    await prisma.token.delete({
      where: {
        jti: payload.jti,
      },
    });
    throw new InvalidToken('Token has expired');
  }

  return { header, payload };
};

export const revokeToken = async (token: string) => {
  const [_, __, signature] = token.split('.');

  const { payload } = await verifyToken(token);

  await prisma.token.delete({
    where: {
      jti: payload.jti,
    },
  });

  return signature;
};
