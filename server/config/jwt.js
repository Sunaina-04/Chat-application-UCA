import jwt from 'jsonwebtoken';

const JWT_EXPIRES_IN = '7d';

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET must be configured');
  }
  return secret;
};

export const assertJwtSecretConfigured = () => {
  getJwtSecret();
};

export const generateToken = (payload) => {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token) => {
  const secret = getJwtSecret();
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};
