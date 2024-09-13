import { Router } from "express";
import userService from "../service/userService.js"

const routes = Router();

routes.post('/',userService.createUser)
routes.post('/login',userService.authenticateUser);
routes.put('/preferences/:userId',userService.userPreferences)
routes.get('/recommended-restaurants/:userId',userService.getRecommendedRestaurants)

export default routes;