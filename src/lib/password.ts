import { randomBytes, pbkdf2, BinaryLike } from 'crypto';

/**
 *
 * @param password Password to hash
 * @param salt Salt to hash password with
 * @returns Hashed password
 */
const pbkdf2Async = (password: string, salt: BinaryLike): Promise<string> => {
  return new Promise((resolve, reject) => {
    pbkdf2(password, salt, 2100000, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey.toString('base64'));
    });
  });
};

/**
 *
 * @param password Password to hash
 * @param salt (Optional) Salt to hash password with. Used to re-hash passwords for verification. If blank, salt will be generated
 */
export const hashPassword = async (
  password: string,
  salt?: string
): Promise<string> => {
  const saltBuffer =
    salt !== undefined ? Buffer.from(salt, 'base64') : randomBytes(32);

  const pbkdf2Hash = await pbkdf2Async(password, saltBuffer);

  return `${pbkdf2Hash}:${saltBuffer.toString('base64')}`;
};

/**
 *
 * @param plainTextPassword Password to validate
 * @param completeHash A known hashed version of the password you want to check against. Format: hashedPassword:salt
 * @returns Whether the password matches or not (valid)
 */
export const isPasswordValid = async (
  plainTextPassword: string,
  completeHash: string
): Promise<boolean> => {
  const [_, salt] = completeHash.split(':');

  const recalculatedHash = await hashPassword(plainTextPassword, salt);

  return recalculatedHash === completeHash;
};
