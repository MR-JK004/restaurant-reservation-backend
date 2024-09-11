import mongoose from './index.js';

const reviewSchema = new mongoose.Schema({
    review_id:{
        type:String,
        required:true
    },
    user: {
        type: String,
        required: true
    },
    restaurant: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating must be at most 5']
    },
    comment: {
        type: String,
        required: true
    },
    reply:{
        type:String
    }
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
