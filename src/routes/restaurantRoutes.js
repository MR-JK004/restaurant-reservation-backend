import { Router } from "express";
import restaurantService from "../service/restaurantService.js"

const routes = Router();

routes.post('/add-restaurant',restaurantService.createRestaurant);
routes.get('/featured-restaurants',restaurantService.getFeaturedRestaurant)
routes.get('/restaurant-list',restaurantService.getAllRestaurants)
routes.get('/cuisine-filter',restaurantService.filterByCuisine)
routes.get('/price-filter',restaurantService.filterByPrice)
routes.get('/:id',restaurantService.getRestaurantById);
routes.post('/booking',restaurantService.bookingRestaurant)
routes.put('/update-featured',restaurantService.updateFeatured)

export default routes;