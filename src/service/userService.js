import userModel from '../model/userModel.js'
import restaurantModel from '../model/restaurantModel.js';
import reviewModel from '../model/reviewModel.js'
import { validatePassword } from '../common/validation.js';
import Function from '../common/Function.js'
import auth from '../common/Function.js'

const createUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        let userId;
        let isUnique = false;

        while (!isUnique) {
            userId = Function.generateRandomUserId();
            const existingUser = await userModel.findOne({id: userId});
            if (!existingUser) {
                isUnique = true;
            }
        }

        let user = await userModel.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        if (!validatePassword(password)) {
            return res.status(400).json({
                message: 'Password must contain at least 8 characters, one lowercase letter, one uppercase letter, one number, and one special character'
            });
        }

        const hashedPassword = await Function.hashPassword(password);
        user = await userModel.create({ ...req.body, password: hashedPassword,user_id:userId });

        res.status(201).send({
            message: "Registration Successful"
        });
    } catch (error) {
        res.status(500).send({
            message: error.message || "Internal Server Error"
        });
    }
}

const authenticateUser = async (req, res) => {
    try {
        let user = await userModel.findOne({ email: req.body.email });
        if (user) {
            if (await Function.hashCompare(req.body.password, user.password)) {
                    let payload = {
                        email: user.email,
                        name:user.name,
                        user_id:user.user_id
                    };
                    let token = await auth.createToken(payload);

                    res.status(200).send({
                        message: "Login Successful",
                        token
                    });
            } else {
                res.status(400).send({
                    message: "Incorrect Password"
                });
            }
        } else {
            res.status(400).send({
                message: "User does not exist"
            });
        }
    } catch (error) {
        res.status(500).send({
            message: error.message || "Internal Server Error",
            error
        });
    }
}

const userPreferences = async (req, res) => {
    const { userId } = req.params;
    const { cuisines, budget, location } = req.body;

    try {
       
        const user = await userModel.findOneAndUpdate(
            { user_id: userId },
            { 
                $set: {
                    preferences: {
                        cuisines,   
                        budget,     
                        location    
                    }
                }
            },
            { new: true, upsert: false }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'Preferences updated successfully', user });
    } catch (error) {
        console.error('Error updating preferences:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const getRecommendedRestaurants = async (req, res) => {
    const { userId } = req.params; 

    try {
        const user = await userModel.findOne({ user_id: userId });

        if (!user || !user.preferences || (Array.isArray(user.preferences.cuisines) && user.preferences.cuisines.length === 0)) {
            return res.status(404).json({ message: 'User preferences not found' });
        }

        const { cuisines, budget, location } = user.preferences;

        const restaurants = await restaurantModel.find({
            cuisine_type: { $in: cuisines }, 
            price: { $lte: budget },         
            location: location               
        });

        if (restaurants.length === 0) {
            return res.status(404).json({ message: 'No restaurants match your preferences' });
        }

        const restaurantIds = restaurants.map(restaurant => restaurant.restaurant_id);
        const ratings = await reviewModel.aggregate([
            { $match: { restaurant: { $in: restaurantIds } } },  
            {
                $group: {
                    _id: '$restaurant',        
                    averageRating: { $avg: '$rating' } 
                }
            },
            { $sort: { averageRating: -1 } }  
        ]);

        const recommendedRestaurants = restaurants.map(restaurant => {
            const restaurantRating = ratings.find(r => r._id === restaurant.restaurant_id);
            return {
                ...restaurant.toObject(),
                averageRating: restaurantRating ? restaurantRating.averageRating : null
            };
        });

        res.status(200).json({ restaurants: recommendedRestaurants });

    } catch (error) {
        console.error('Error fetching recommended restaurants:', error);
        res.status(500).json({ error: 'Server error' });
    }
};


export default {
    createUser,
    authenticateUser,
    userPreferences,
    getRecommendedRestaurants
}
