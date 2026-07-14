import express from "express"
import { connectDB } from "./config/db.js"
import dotenv from "dotenv"

import http from "http"

import { initSocket } from "./sockets/serverSocket.js"

import departmentrouter from "./routes/departmentRoutes.js"
import authrouter from "./routes/authRoutes.js"
import ticketrouter from "./routes/ticketRoutes.js"
import userrouter from "./routes/userRoutes.js"

import cookieParser from "cookie-parser"

import "./jobs/scheduler.js"

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());

connectDB();

const server = http.createServer(app);
const io = initSocket(server);

app.use("/report/department",departmentrouter);
app.use("/report/auth",authrouter);
app.use("/report/ticket",ticketrouter);
app.use("/report/user",userrouter);

server.listen(process.env.PORT, () =>
{
    console.log(`Server started at ${process.env.PORT}`);
});