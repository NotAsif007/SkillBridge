import dotenv from 'dotenv';

dotenv.config();

const isTest = process.env.NODE_ENV === 'test';
const isDev = (process.env.NODE_ENV || 'development') === 'development';
const isProd = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'prod';

const required = (key, testFallback = '') => {
  const value = process.env[key] || (isTest ? testFallback : '');
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const optional = (key, fallback) => process.env[key] || fallback;

// JWT Secret validation - prevent using weak default secret in production
const jwtSecret = optional('JWT_SECRET', isTest ? 'careeros_test_secret_key_12345' : 'careeros_jwt_dev_secret_key_12345');
if (isProd && (jwtSecret === 'careeros_jwt_dev_secret_key_12345' || jwtSecret.length < 32)) {
  throw new Error('FATAL: JWT_SECRET must be at least 32 characters long and cannot be a default development secret in production.');
}

export const config = {
  nodeEnv: optional('NODE_ENV', 'development'),
  port: parseInt(optional('PORT', '5000'), 10),
  mongoUri: required('MONGO_URI', 'mongodb://localhost:27017/careeros_test'),

  clientUrl: optional('CLIENT_URL', 'http://localhost:5173'),
  apiBaseUrl: optional('API_BASE_URL', 'http://localhost:5000/api/v1'),

  allowDevLogin: process.env.ALLOW_DEV_LOGIN === 'true' || isTest || isDev,

  google: {
    clientId: optional('GOOGLE_CLIENT_ID', ''),
    clientSecret: optional('GOOGLE_CLIENT_SECRET', ''),
    callbackUrl: optional('GOOGLE_CALLBACK_URL', 'http://localhost:5000/api/v1/auth/google/callback'),
  },

  jwt: {
    secret: jwtSecret,
    expiresIn: optional('JWT_EXPIRES_IN', '7d'),
    issuer: 'careeros-api',
    audience: 'careeros-client',
  },

  gemini: {
    apiKey: optional('GEMINI_API_KEY', ''),
  },

  isDev,
  isProd,
  isTest,
};