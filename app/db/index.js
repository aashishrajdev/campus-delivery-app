import mongoose from 'mongoose'
import dotenv from 'dotenv/config'
const dbConnect = async () => {
    try {
        const dbConnectionInstatances = await mongoose.connect(process.env.MONGO_URI).then((
            console.log("Database Connected")
        ))
    } catch (error) {
        console.error(error)
    }
}

export default dbConnect;







