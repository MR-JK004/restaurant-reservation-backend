import mongoose from './index.js'

const bookingSchema = new mongoose.Schema({
    booking_id:{
        type:String,
        required:true
    },
    name:{
        type:String
    },
    no_of_people:{
        type:Number,
        max:[10,"Only upto 10 Peoples are Allowed"]
    },
    user:{
        type:String,
        required:true
    },
    restaurant:{
        type:String,
        required:true
    },
    special_occasion:{
        type:String
    },
    date:{
        type:Date,
        required:true
    },
    startTime:{
        type:Date,
        required:true
    },
    endTime:{
        type:Date,
        required:true
    }
})

const Bookings = mongoose.model('Bookings',bookingSchema)

export default Bookings;