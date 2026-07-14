import express from "express"
import {login, refreshAccessToken, register,logout, createDepartmentAdmin} from "../controller/authController.js"
import { authMiddleware } from "../middleware/authMiddleware.js";
import { restrictTo } from "../middleware/restrictTo.js";

const authrouter = express.Router();

authrouter.post("/register", register);
authrouter.post("/login", login);
authrouter.post("/refreshtoken", refreshAccessToken);
authrouter.post("/logout", logout);
authrouter.post("/create-admin", authMiddleware, restrictTo("super_admin"), createDepartmentAdmin);



export default authrouter;