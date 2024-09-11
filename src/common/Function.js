import 'dotenv/config.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const hashPassword = async(password)=>{
    try {
        let salt =  await bcrypt.genSalt(Number(process.env.SALT))
        let hashedPassword = await bcrypt.hash(password,salt)
        return hashedPassword

    } catch (error) {
        throw error
    }
}

const hashCompare = async(password,hashedPassword)=>{
    try {
       return await bcrypt.compare(password,hashedPassword)
    } catch (error) {
        throw error
    }
}

const createToken = async(payload)=>{
    try {
        return await jwt.sign(
            payload,
            process.env.SECRET_KEY,
            {expiresIn:'1h'}
        )
     } catch (error) {
         throw error
     }
}

const decodeToken = async(token)=>{
    try {
        return await jwt.decode(token)
     } catch (error) {
         throw error
     }
}

const generateRandomId = (length = 12) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        result += chars[randomIndex];
    }
    return result;
};

const generateRandomUserId = (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        result += chars[randomIndex];
    }
    return result;
};

const generateRandomBookingId = (length = 6) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        result += chars[randomIndex];
    }
    return result;
};

const generateRandomReviewId = (length = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        result += chars[randomIndex];
    }
    return result;
};

export default{
    hashPassword,
    hashCompare,
    createToken,
    decodeToken,
    generateRandomId,
    generateRandomUserId,
    generateRandomBookingId,
    generateRandomReviewId
}
