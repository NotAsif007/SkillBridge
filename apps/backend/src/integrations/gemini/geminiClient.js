import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

let genAI = null;

export function getGeminiClient() {
  if (!genAI && config.gemini.apiKey) {
    try {
      genAI = new GoogleGenerativeAI(config.gemini.apiKey);
      logger.info('Gemini AI Client initialized successfully');
    } catch (err) {
      logger.warn(`Failed to initialize Gemini AI: ${err.message}`);
    }
  }
  return genAI;
}

export function isGeminiConfigured() {
  return Boolean(config.gemini.apiKey);
}