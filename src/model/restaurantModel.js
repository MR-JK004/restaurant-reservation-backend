import mongoose from './index.js';

const restaurantSchema = new mongoose.Schema({
    featured_image:{
        type:String,
        required:true
    },
    name: {
        type: String,
        required: true
    },
    restaurant_id:{
        type:String,
        required:true
    },
    address: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    location:{type:String},
    menu: [
        {
            category: String,
            items: [
                {
                    menu_item_name: String,
                    menu_item_price: String,
                    isSignatureDish: { type: Boolean, default: false }
                }
            ]
        }
    ],
    contact_number: {
        type: String
    },
    email:{
        type: String
    },
    date:{Date},
    start_time:{String},
    end_time:{String},
    cuisine_type: [String],
    features: [String]
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

export default Restaurant;