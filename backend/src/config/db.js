//this is mongodb connection setup
import mongoose from 'mongoose';
const connectDB= async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI);
console.log('Mongodb Connected')
    }
    catch(err){
        console.log('MOngodb connection error', err.message);
        process.exit(1);
    }
}
export default connectDB;