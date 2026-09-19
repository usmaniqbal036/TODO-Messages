import mongoose from 'mongoose';

let connectionPromise = null;

export function connectDB() {
  if (!connectionPromise) {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error('MONGO_URI environment variable is not set');
    }

    connectionPromise = mongoose
      .connect(mongoUri)
      .then(() => {
        console.log('MongoDB connected');
      })
      .catch((error) => {
        console.error('MongoDB connection failed:', error.message);
        connectionPromise = null; // taake agli request dobara try kare
        throw error;
      });
  }

  return connectionPromise;
}