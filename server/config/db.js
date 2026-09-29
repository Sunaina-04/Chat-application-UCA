import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    logger.warn('No MONGODB_URI provided. Running in Demo In-Memory Store mode.');
    return false;
  }

  try {
    // Attempt Mongoose connection with short timeout so it never hangs
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 1200,
    });
    logger.success('✅ Connected to MongoDB successfully via Mongoose.');
    return true;
  } catch (error) {
    logger.warn(`⚠️ Could not connect to MongoDB (${error.message}).`);
    logger.info('🚀 Seamlessly falling back to ChatSpace High-Performance In-Memory Demo Store!');
    return false;
  }
};
