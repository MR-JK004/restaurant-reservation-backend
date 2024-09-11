import restaurantModel from '../model/restaurantModel.js';
import reviewModel from '../model/reviewModel.js'
import Function from '../common/Function.js'
import userModel from '../model/userModel.js';
import bookingModel from '../model/bookingModel.js'
import moment from 'moment-timezone';

const createRestaurant = async (req, res) => {
    try {
        let restaurantId;
        let isUnique = false;

        while (!isUnique) {
            restaurantId = Function.generateRandomId();
            const existingRestaurant = await restaurantModel.findOne({ id: restaurantId });
            if (!existingRestaurant) {
                isUnique = true;
            }
        }

        let restaurant = await restaurantModel.create({
            ...req.body,
            restaurant_id: restaurantId
        });

        res.status(201).send({
            message: "Restaurant Added Successfully",
            restaurant
        });

    } catch (error) {
        res.status(500).send({
            message: error.message || "Internal Server Error"
        });
    }
};


const getAllRestaurants = async (req, res) => {
    try {
        const { location, date, startTime, endTime } = req.query;

        if (!location || !date || !startTime || !endTime) {
            const ratings = await reviewModel.aggregate([
                {
                    $group: {
                        _id: "$restaurant",
                        averageRating: { $avg: "$rating" }
                    }
                }
            ]);

            const ratingsMap = ratings.reduce((acc, { _id, averageRating }) => {
                acc[_id] = averageRating;
                return acc;
            }, {});

            const restaurants = await restaurantModel.find();
            const restaurantsWithRatings = restaurants.map(restaurant => {
                return {
                    ...restaurant.toObject(),
                    averageRating: ratingsMap[restaurant.restaurant_id] || null
                };
            });

            return res.status(200).json(restaurantsWithRatings);
        } else {

            const newStartDate = moment.utc(`${date}T${startTime}`).toDate();
            const newEndDate = moment.utc(`${date}T${endTime}`).toDate();


            const restaurants = await restaurantModel.find({ location });

            if (!restaurants.length) {
                return res.status(404).send({ message: "No restaurants found for the location." });
            }

            const conflictingBookings = await bookingModel.find({
                restaurant: { $in: restaurants.map(restaurant => restaurant.restaurant_id) },
                $or: [
                    {
                        $and: [
                            { startTime: { $lt: newEndDate } },
                            { endTime: { $gt: newStartDate } }
                        ]
                    },
                    {
                        $and: [
                            { startTime: { $lt: newEndDate } },
                            { endTime: { $gt: newEndDate } }
                        ]
                    },
                    {
                        $and: [
                            { startTime: { $lt: newStartDate } },
                            { endTime: { $gt: newStartDate } }
                        ]
                    },
                    {
                        $and: [
                            { startTime: { $gte: newStartDate } },
                            { endTime: { $lte: newEndDate } }
                        ]
                    }
                ]
            });

            const bookedRestaurantIds = new Set(conflictingBookings.map(booking => booking.restaurant.toString()));


            const availableRestaurants = restaurants.filter(restaurant => !bookedRestaurantIds.has(restaurant.restaurant_id.toString()));


            const ratings = await reviewModel.aggregate([
                {
                    $group: {
                        _id: "$restaurant",
                        averageRating: { $avg: "$rating" }
                    }
                }
            ]);

            const ratingsMap = ratings.reduce((acc, { _id, averageRating }) => {
                acc[_id] = averageRating;
                return acc;
            }, {});

            const restaurantsWithRatings = availableRestaurants.map(restaurant => {
                return {
                    ...restaurant.toObject(),
                    averageRating: ratingsMap[restaurant.restaurant_id] || null
                };
            });

            return res.status(200).json(restaurantsWithRatings);
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};


const getRestaurantById = async (req, res) => {
    try {
        const { id } = req.params;
        const restaurant = await restaurantModel.findOne({ restaurant_id: id });
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant Not Found" });
        }

        const reviews = await reviewModel.find({ restaurant: restaurant.restaurant_id });

        // Calculate average rating
        const averageRating = reviews.length
            ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
            : null;

        // Fetch user details
        const userIds = [...new Set(reviews.map(review => review.user))];
        const users = await userModel.find({ user_id: { $in: userIds } });

        const userMap = users.reduce((map, user) => {
            map[user.user_id] = user;
            return map;
        }, {});

        // Include user names in reviews
        const reviewsWithUserNames = reviews.map(review => ({
            ...review._doc,
            reviewerName: userMap[review.user]?.name || 'Unknown'
        }));

        res.status(200).json({ restaurant, reviews: reviewsWithUserNames, averageRating });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};



const filterByCuisine = async (req, res) => {
    try {
        const { cuisines } = req.query;
        if (cuisines == undefined) {
            const ratings = await reviewModel.aggregate([
                {
                    $group: {
                        _id: "$restaurant",
                        averageRating: { $avg: "$rating" }
                    }
                }
            ]);

            const ratingsMap = ratings.reduce((acc, { _id, averageRating }) => {
                acc[_id] = averageRating;
                return acc;
            }, {});

            const restaurants = await restaurantModel.find();
            const restaurantsWithRatings = restaurants.map(restaurant => {
                return {
                    ...restaurant.toObject(),
                    averageRating: ratingsMap[restaurant.restaurant_id] || null
                };
            });

            return res.status(200).json(restaurantsWithRatings);
        }
        const cuisineArray = Array.isArray(cuisines) ? cuisines : [cuisines];
        const restaurants = await restaurantModel.find({ cuisine_type: { $in: cuisineArray } });

        const ratings = await reviewModel.aggregate([
            {
                $group: {
                    _id: "$restaurant",
                    averageRating: { $avg: "$rating" }
                }
            }
        ]);

        const ratingsMap = ratings.reduce((acc, { _id, averageRating }) => {
            acc[_id] = averageRating;
            return acc;
        }, {});

        const restaurantsWithRatings = restaurants.map(restaurant => {
            return {
                ...restaurant.toObject(),
                averageRating: ratingsMap[restaurant.restaurant_id] || null
            };
        });

        return res.status(200).json(restaurantsWithRatings);

    } catch (error) {
        console.error('Error:', error);
        res.status(400).send({
            message: error.message || "Internal Server Error"
        });
    }
};

const filterByPrice = async (req, res) => {
    try {
        const { prices } = req.query;
        if (prices == undefined) {
            const ratings = await reviewModel.aggregate([
                {
                    $group: {
                        _id: "$restaurant",
                        averageRating: { $avg: "$rating" }
                    }
                }
            ]);

            const ratingsMap = ratings.reduce((acc, { _id, averageRating }) => {
                acc[_id] = averageRating;
                return acc;
            }, {});

            const restaurants = await restaurantModel.find();
            const restaurantsWithRatings = restaurants.map(restaurant => {
                return {
                    ...restaurant.toObject(),
                    averageRating: ratingsMap[restaurant.restaurant_id] || null
                };
            });

            return res.status(200).json(restaurantsWithRatings);
        }

        const priceRanges = prices ? JSON.parse(prices) : [];
        const priceConditions = [];

        if (priceRanges.includes('Under ₹1,000')) {
            priceConditions.push({ price: { $lt: 1000 } });
        }
        if (priceRanges.includes('₹1,000-₹5,000')) {
            priceConditions.push({ price: { $gte: 1000, $lte: 5000 } });
        }
        if (priceRanges.includes('Above ₹5,000')) {
            priceConditions.push({ price: { $gt: 5000 } });
        }

        const query = priceConditions.length > 0 ? { $or: priceConditions } : {};

        const restaurants = await restaurantModel.find(query)
        if ((await restaurants).length > 0) {
            const ratings = await reviewModel.aggregate([
                {
                    $group: {
                        _id: "$restaurant",
                        averageRating: { $avg: "$rating" }
                    }
                }
            ]);

            const ratingsMap = ratings.reduce((acc, { _id, averageRating }) => {
                acc[_id] = averageRating;
                return acc;
            }, {});

            const restaurantsWithRatings = restaurants.map(restaurant => {
                return {
                    ...restaurant.toObject(),
                    averageRating: ratingsMap[restaurant.restaurant_id] || null
                };
            });

            return res.status(200).json(restaurantsWithRatings);
        }
        else {
            return res.status(404).send({
                message: "No Restaurant Found for the Specified Price"
            })
        }

    }
    catch (error) {
        console.error("Error filtering by price:", error);
        res.status(500).send({
            message: error.message || "Internal Server Error"
        })
    }
}

const bookingRestaurant = async (req, res) => {
    try {
        let booking_id = Function.generateRandomBookingId();
        const { startTime, endTime, email } = req.body;

        const localStartTime = new Date(startTime).toLocaleString();
        const localEndTime = new Date(endTime).toLocaleString();

        console.log('Local Start Time:', localStartTime);
        console.log('Local End Time:', localEndTime);

        let isUnique = false;

        const existingBooking = await bookingModel.findOne({ id: booking_id });
        if (!existingBooking) {
            isUnique = true;
        }

        let user = await userModel.findOne({ email: email });

        if (!user) {
            return res.status(400).send({
                message: "User with this email id does not exist",
            });
        }

        let booking = await bookingModel.create({
            ...req.body,
            booking_id: booking_id
        });

        res.status(201).send({
            message: "Restaurant Booked Successfully",
        });
    } catch (error) {
        console.log(error);
        if (!res.headersSent) {
            res.status(500).json({
                message: error.message || "Internal Server Error"
            });
        }
    }
};

export default {
    createRestaurant,
    getAllRestaurants,
    getRestaurantById,
    filterByCuisine,
    bookingRestaurant,
    filterByPrice
};
