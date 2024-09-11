import mongoose from "mongoose";
import 'dotenv/config.js'

mongoose.connect(`${process.env.MONGODB_URL}/${process.env.MONGODB_NAME}`)
.then(()=>console.log("MONGODB CONNECTED !!!"))
.catch((error)=>console.log(error))

export default mongoose;