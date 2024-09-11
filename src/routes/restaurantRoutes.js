import { Router } from "express";
import restaurantService from "../service/restaurantService.js"

const routes = Router();

routes.post('/add-restaurant',restaurantService.createRestaurant);
routes.get('/restaurant-list',restaurantService.getAllRestaurants)
routes.get('/cuisine-filter',restaurantService.filterByCuisine)
routes.get('/price-filter',restaurantService.filterByPrice)
routes.get('/:id',restaurantService.getRestaurantById);
routes.post('/booking',restaurantService.bookingRestaurant)

export default routes;