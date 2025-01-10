import mongoose from 'mongoose'

if (!process.env.NEXT_MONGODB_URI) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.NEXT_MONGODB_URI

const status = {
    isConnected: 0
}

export const connectDB = async () => {
    // If already connected, return the existing connection
    if (status.isConnected === 1) {
        return mongoose
    }

    // If mongoose has an existing connection, use it
    if (mongoose.connections.length > 0) {
        status.isConnected = mongoose.connections[0].readyState
        if (status.isConnected === 1) {
            return mongoose
        }
        // If not connected, disconnect to ensure clean slate
        await mongoose.disconnect()
    }

    // Set up mongoose configuration
    mongoose.set('strictQuery', true)

    // Connect to MongoDB
    const db = await mongoose.connect(uri)
    status.isConnected = db.connections[0].readyState

    return mongoose
}




const transactionSchema = new mongoose.Schema({
    signature: { type: String, required: true, unique: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    amount: { type: String, required: true },
    slot: { type: Number, required: true },
    blockTime: { type: Number, required: false },
    activity_type: { type: String, required: true },
});

const newsSchema = new mongoose.Schema({
    title: { type: String, required: true },
    mainMessage: { type: String, required: true },
    icon: { type: String, required: true },
    supportingNews: { type: Array, required: true }
});

// Prevent mongoose from creating the model multiple times
export const News = mongoose.models.News || mongoose.model('News', newsSchema);
export const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema)