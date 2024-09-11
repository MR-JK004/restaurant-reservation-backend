import { Router } from "express";
import bookingService from '../service/bookingService.js'

const routes = Router();

routes.get('/history',bookingService.history)
routes.delete('/delete',bookingService.deleteBooking)
routes.put('/modify/:id',bookingService.modifyBooking)
routes.get('/:id',bookingService.getBookingById)

export default routes;