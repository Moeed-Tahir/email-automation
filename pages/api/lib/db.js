const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable in .env.local");
}

let cached = global.mongoose || { conn: null, promise: null };

async function connectToDatabase() {
    if (cached.conn) {
        console.log("Using cached database connection");
        return cached.conn;
    }

    if (!cached.promise) {
        console.log("Creating new database connection...");
        
        cached.promise = mongoose.connect(MONGODB_URI)
            .then((mongoose) => {
                console.log("Database connected successfully");
                return mongoose;
            })
            .catch((error) => {
                console.error("Database connection error:", error);
                throw error;
            });
    }

    try {
        cached.conn = await cached.promise;
        return cached.conn;
    } catch (error) {
        cached.promise = null;
        throw error;
    }
}

module.exports = connectToDatabase;
