import express from "express"
import { authMiddleware } from "../middleware/authMiddleware.js";
import { updateStatus } from "../controller/userController.js";

const userrouter = express.Router();

userrouter.patch("/status", authMiddleware,updateStatus);

export default userrouter;