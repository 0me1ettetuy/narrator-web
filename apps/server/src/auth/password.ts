import bcrypt from 'bcryptjs';

const DEFAULT_BCRYPT_ROUNDS = 12;

const getBcryptRounds = () => {
  const rounds = Number(process.env.AUTH_BCRYPT_ROUNDS ?? DEFAULT_BCRYPT_ROUNDS);

  if (!Number.isInteger(rounds) || rounds < 10 || rounds > 14) {
    return DEFAULT_BCRYPT_ROUNDS;
  }

  return rounds;
};

export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, getBcryptRounds());
};

export const verifyPassword = async (password: string, passwordHash: string) => {
  return bcrypt.compare(password, passwordHash);
};
