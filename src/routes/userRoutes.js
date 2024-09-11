import { Router } from "express";
import userService from "../service/userService.js"

const routes = Router();

routes.post('/',userService.createUser)
routes.post('/login',userService.authenticateUser);

export default routes;