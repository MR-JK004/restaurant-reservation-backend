import bookingModel from '../model/bookingModel.js'
import restaurantModel from '../model/restaurantModel.js'

const history = async (req, res) => {
    try {
        const { id } = req.query;  // Extract 'id' from query parameters

        let bookingsWithRestaurantDetails;

        if (!id) {
            // Fetch all bookings with restaurant details if no 'id' is provided
            bookingsWithRestaurantDetails = await bookingModel.aggregate([
                {
                    $lookup: {
                        from: 'restaurants',
                        localField: 'restaurant',
                        foreignField: 'restaurant_id',
                        as: 'restaurantDetails'
                    }
                },
                {
                    $unwind: '$restaurantDetails'
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user',
                        foreignField: 'user_id',
                        as: 'userDetails'
                    },
                },
                {
                    $unwind: "$userDetails"
                },
                {
                    $project: {
                        date: 1, 
                        startTime: 1,
                        endTime: 1,
                        special_occasion: 1,
                        booking_id: 1,
                        'restaurantDetails.name': 1,
                        'restaurantDetails.address': 1,
                        'restaurantDetails.featured_image': 1,
                        'userDetails.name': 1,
                    }
                }
            ]);
        } else {
            // Fetch bookings for a specific user 'id' with restaurant details
            bookingsWithRestaurantDetails = await bookingModel.aggregate([
                {
                    $match: { user: id } 
                },
                {
                    $lookup: {
                        from: 'restaurants',
                        localField: 'restaurant',
                        foreignField: 'restaurant_id',
                        as: 'restaurantDetails'
                    }
                },
                {
                    $unwind: '$restaurantDetails'
                },
                {
                    $project: {
                        date: 1, 
                        startTime: 1,
                        endTime: 1,
                        special_occasion: 1,
                        booking_id: 1,
                        'restaurantDetails.name': 1,
                        'restaurantDetails.address': 1,
                        'restaurantDetails.featured_image': 1
                    }
                }
            ]);
        }

        // Return the results
        res.status(200).json(bookingsWithRestaurantDetails);

    } catch (error) {
        console.error(error);  // Log error for debugging
        res.status(500).json({
            message: error.message || "Internal Server Error"
        });
    }
};


const deleteBooking = async(req,res) => {
    try {
       const {id} = req.query;

       const booking = await bookingModel.deleteOne({booking_id:id});

       res.status(204).send({
            message:'Booking Cancelled Successfully'
       })
    } 
    catch (error) {
        res.status(500).json({
            message: error.message || "Internal Server Error"
        });
    }
}

const modifyBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const { startTime, endTime, restaurant } = data;
        
        if (!startTime || !endTime || !restaurant) {
            return res.status(400).send({
                message: 'Missing required fields: startTime, endTime, or restaurant.'
            });
        }

        const conflictingBookings = await bookingModel.find({
            restaurant: restaurant,
            $or: [
                // Booking starts before the new booking ends and ends after the new booking starts
                {
                    $and: [
                        { startTime: { $lt: endTime } },
                        { endTime: { $gt: startTime } }
                    ]
                },
                // Existing booking starts before the new booking ends and ends after the new booking ends
                {
                    $and: [
                        { startTime: { $lt: endTime } },
                        { endTime: { $gt: endTime } }
                    ]
                },
                // Existing booking starts before the new booking starts and ends after the new booking starts
                {
                    $and: [
                        { startTime: { $lt: startTime } },
                        { endTime: { $gt: startTime } }
                    ]
                },
                // Existing booking is completely within the new booking time range
                {
                    $and: [
                        { startTime: { $gte: startTime } },
                        { endTime: { $lte: endTime } }
                    ]
                }
            ]
        });

        if (conflictingBookings.length > 0) {
            return res.status(400).send({
                message: `Restaurant ${restaurant} already booked during the given time.`
            });
        }

        // Proceed with updating the booking
        const result = await bookingModel.updateOne(
            { booking_id: id },
            { $set: data }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).send({
                message: 'Booking not found or no changes made.'
            });
        }

        res.status(200).send({
            message: 'Booking modified successfully.'
        });

    } catch (error) {
        console.error(error);
        res.status(500).send({
            message: 'Internal Server Error'
        });
    }
};

const getBookingById = async(req,res) => {
    
    try {
        const {id} = req.query;
        
        const booking = await bookingModel.findOne({booking_id:id})

        res.status(200).send({
            booking,
            message:"Data Fetch Successfull"
        })
    } 
    catch (error) {
        res.status(500).send({
            message:"Internal Server Error"
        })
    }


}

export default {
    history,
    deleteBooking,
    modifyBooking,
    getBookingById
}