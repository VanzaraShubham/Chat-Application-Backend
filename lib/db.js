import mongoose from "mongoose";

// function to connect mongodb database 
export const connectdb = async () => {
    try {
        mongoose.connection.on('connected', () => console.log('Database Connected'));
        await mongoose.connect(`${process.env.MONGODB_URL}/CHAT_APP`)
    } catch (error) {
        console.log(error);
    }
}