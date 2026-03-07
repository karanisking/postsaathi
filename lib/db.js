// lib/db.js
import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in .env.local')
}

// Cache connection across hot reloads in dev
// and across serverless function calls in prod
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

const connectDB = async () => {
  // Return existing connection if available
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    })
  }

  try {
    cached.conn = await cached.promise
    console.log('DB connected successfully')
    return cached.conn
  } catch (err) {
    cached.promise = null  // reset so next call retries
    console.log('Error while connecting DB', err)
    throw err
  }
}

export default connectDB;