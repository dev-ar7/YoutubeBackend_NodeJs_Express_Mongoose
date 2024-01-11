import mongoose from 'mongoose';

import { DB_NAME } from '../constants.js';


const connectDB = async () => { 
    try {
        const connectionInstance = await mongoose.connect(
                `${process.env.MONGODB_URI}/${DB_NAME}`
            );
            console.log(`\n MONGODB Connected Successfully... !! DB HOST : ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB failed to connect !!!", error);
        process.exit(1);
    }
 }

 export default connectDB;