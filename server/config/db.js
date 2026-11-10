import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

let isMongoConnected = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('<username>') || uri.includes('<password>')) {
    logger.warn('ℹ️  No valid MONGODB_URI configured. Running in High-Performance In-Memory Store mode.');
    isMongoConnected = false;
    return false;
  }

  try {
    // 5-second timeout for MongoDB Atlas cluster connections
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.success('✅ Connected to MongoDB successfully via Mongoose.');
    isMongoConnected = true;
    return true;
  } catch (error) {
    logger.warn(`⚠️ Could not connect to MongoDB (${error.message}).`);
    logger.info('🚀 Seamlessly falling back to ChatSpace High-Performance In-Memory Demo Store!');
    isMongoConnected = false;
    return false;
  }
};

export const getDBStatus = () => ({
  connected: isMongoConnected,
  mode: isMongoConnected ? 'mongodb' : 'in-memory',
  uriConfigured: Boolean(process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('<username>')),
});
