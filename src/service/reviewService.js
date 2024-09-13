import reviewModel from '../model/reviewModel.js';
import Function from '../common/Function.js';


const createReview = async(req,res) => {
    try {
        let reviewId;
        let isUnique = false;

        while (!isUnique) {
            reviewId = Function.generateRandomReviewId();
            const existingReview = await reviewModel.findOne({review_id: reviewId});
            if (!existingReview) {
                isUnique = true;
            }
        }

       let reviews = await reviewModel.create({
            ...req.body,
            review_id:reviewId
       })
        res.status(201).send({
        message: "Review Submitted Successfully"
    });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error || "Internal Server Error" });
    }
}

const fetchReviews = async (req, res) => {
    try {
        const { id } = req.params;
        const reviewWithDetails = await reviewModel.aggregate([
            {
                $match: { restaurant: id }
            },
            {
                $lookup: {
                    from: 'restaurants',
                    localField: 'restaurant',
                    foreignField: 'restaurant_id',
                    as: 'restaurantDetails'
                },
            },
            {
                $unwind: "$restaurantDetails"
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
                    rating: 1,
                    comment: 1,
                    'restaurantDetails.name': 1,
                    'userDetails.name': 1,
                    'userDetails.user_id': 1
                }
            }
        ]);

        res.status(200).send({
            message: "Data Fetch Successful",
            reviews: reviewWithDetails 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

const replyReview = async(req,res) => {
    try {

        const { reviewId, replyText } = req.body;

        if (!replyText) {
            return res.status(400).json({ message: "Reply is required" });
        }

        const result = await reviewModel.updateOne(
            { user: reviewId }, 
            { $set: { reply: replyText } }
        );
        if(result.modifiedCount > 0){
            res.status(200).send({ message: "Replied Successfully" });
        }

    } catch (error) {
        res.status(500).json({ message: error || "Internal Server Error" });
    }
} 

const editReview = async(req,res) => {
    try {
        const {id} = req.params;
        const {restaurant} = req.query;
        const data = req.body;
        console.log(restaurant)

        const review_exist = await reviewModel.findOne({review_id:id})
        
        if(!review_exist){
            return res.status(404).send({
                message: "Add Review to Edit"
            });
        }

        const review = await reviewModel.updateOne({review_id:id},{$set:data})

        res.status(200).send({
        message: "Review Edited Successfully"
    });
    } catch (error) {
        res.status(500).json({ message: error || "Internal Server Error" });
    }
}

const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { restaurant_id } = req.query;

        const reviewExist = await reviewModel.findOne({ user: id, restaurant: restaurant_id });

        if (!reviewExist) {
            return res.status(404).send({
                message: "No review found for this user at this restaurant."
            });
        }

        await reviewModel.deleteOne({ user: id, restaurant: restaurant_id });

        res.status(200).send({
            message: "Review deleted successfully."
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
}

const fetchUserReview = async (req, res) => {
    try {
        const { id } = req.params; 
        const { restaurant_id } = req.query; 

        const reviews = await reviewModel.find({ user: id, restaurant: restaurant_id });

        if (reviews.length > 0) {
            res.status(200).json({
                reviews: reviews
            });
        } else {
            res.status(404).json({
                message: 'No reviews found for this user at this restaurant.'
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'An error occurred while fetching reviews.'
        });
    }
}


export default{
    createReview,
    fetchReviews,
    replyReview,
    editReview,
    deleteReview,
    fetchUserReview
}

