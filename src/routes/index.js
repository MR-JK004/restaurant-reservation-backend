import { Router } from "express";
import userRoutes from './userRoutes.js'
import restaurantRoutes from './restaurantRoutes.js'
import reviewRoutes from './reviewRoutes.js'
import bookingRoutes from './bookingRoutes.js'

const routes = Router();

//userRoutes
routes.use('/users', userRoutes);

//restaurantRoutes
routes.use('/restaurant',restaurantRoutes)

//reviewRoutes
routes.use('/review',reviewRoutes)

//bookingRoutes
routes.use('/bookings', bookingRoutes)

export default routes;