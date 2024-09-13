import mongoose from "./index.js";
import { validateEmail } from "../common/validation.js";

const userSchema = new mongoose.Schema({
    user_id: { type: String, required: true },
    name: { type: String, required: true },
    email: {
        type: String,
        unique: true,
        validate: {
            validator: validateEmail,
            message: props => `${props.value} is not a valid email!`
        }
    },
    password: { type: String, required: true },
    preferences: {
        cuisines: [String],  
        budget: Number,      
        location: String ,   
    }
});

const User = mongoose.model('User', userSchema);
export default User;
