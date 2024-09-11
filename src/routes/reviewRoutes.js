import { Router } from "express";
import reviewService from "../service/reviewService.js";

const routes = Router();

routes.post('/',reviewService.createReview)
routes.get('/user/:id',reviewService.fetchUserReview)
routes.get('/:id',reviewService.fetchReviews)
routes.put('/reply',reviewService.replyReview)
routes.delete('/delete/:id',reviewService.deleteReview)
routes.put('/edit/:id',reviewService.editReview)

export default routes;