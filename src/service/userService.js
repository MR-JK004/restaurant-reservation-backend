import userModel from '../model/userModel.js'
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


export default {
    createUser,
    authenticateUser
}
