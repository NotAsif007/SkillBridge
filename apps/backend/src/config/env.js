import dotenv from 'dotenv';

dotenv.config();

const isTest = process.env.NODE_ENV === 'test';

const required = (key, testFallback = '') => {
  const value = process.env[key] || (isTest ? testFallback : '');
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const optional = (key, fallback) => process.env[key] || fallback;

export const config = {
  nodeEnv: optional('NODE_ENV', 'development'),
  port: parseInt(optional('PORT', '5000'), 10),
  mongoUri: required('MONGO_URI', 'mongodb://localhost:27017/careeros_test'),

  clientUrl: optional('CLIENT_URL', 'http://localhost:5173'),
  apiBaseUrl: optional('API_BASE_URL', 'http://localhost:5000/api/v1'),

  google: {
    clientId: optional('GOOGLE_CLIENT_ID', ''),
    clientSecret: optional('GOOGLE_CLIENT_SECRET', ''),
    callbackUrl: optional('GOOGLE_CALLBACK_URL', 'http://localhost:5000/api/v1/auth/google/callback'),
  },

  jwt: {
    secret: optional('JWT_SECRET', 'careeros_jwt_dev_secret_key_12345'),
    expiresIn: optional('JWT_EXPIRES_IN', '7d'),
  },

  gemini: {
    apiKey: optional('GEMINI_API_KEY', ''),
  },

  isDev: optional('NODE_ENV', 'development') === 'development',
  isProd: optional('NODE_ENV', 'development') === 'production',
  isTest,
};