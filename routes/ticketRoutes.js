import express from "express"
import { createTicket, getAllTickets, getTicketById, updateTicket, getDepartmentQueue, getDashboard } from "../controller/ticketController.js"
import {authMiddleware} from "../middleware/authMiddleware.js"


const ticketrouter = express.Router();

ticketrouter.post("/ticketcreate", authMiddleware, createTicket);
ticketrouter.get("/getalltickets", authMiddleware, getAllTickets);
ticketrouter.get("/getoneticket/:id", authMiddleware, getTicketById);
ticketrouter.patch("/updateticket/:id", authMiddleware, updateTicket);
ticketrouter.get("/department/:id/queue", authMiddleware, getDepartmentQueue);
ticketrouter.get("/getDashboard", authMiddleware, getDashboard);

export default ticketrouter;