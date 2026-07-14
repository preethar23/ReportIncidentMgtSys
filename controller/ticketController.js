import Ticket from "../model/ticketModel.js"
import Department from "../model/departmentModel.js"
import TicketLog from "../model/ticketLogModel.js"
import Client from "../model/userModel.js"


import { tryAssignTicket } from "../services/assignmentService.js"
import { emitQueueUpdated, emitTicketResolved } from "../sockets/ticketEvents.js"

export const createTicket = async (req, res) => {
    try {
        const { title, description, priority } = req.body;
        const createdBy = req.user._id;

        if (!title) {
            console.log("Title is compulsory");
            return res.status(400).json({
                success: false,
                message: "Title is compulsory"
            });
        }

        const checkKeyword = (title + "  " + description).toLowerCase();


        const allDepartmentKey = await Department.find();
        if (!allDepartmentKey) {
            console.log("No department Found");
            return res.status(404).json({
                success: false,
                message: "No department Found"
            });
        }

        let matchedID = null;
        for (const dept of allDepartmentKey) {
            for (const keyword of dept.keywords) {

                if (checkKeyword.includes(keyword)) {
                    matchedID = dept._id;
                }
            }
        }

        if (!matchedID) {
            console.log("No Department Id matched");
            return res.status(400).json({
                success: false,
                message: "No Department Id matched"
            });
        }

        const priorityMap = {
            "critical": 4,
            "high": 3,
            "medium": 2,
            "low": 1
        }

        const priorityWeight = priorityMap[priority || "medium"];

        const createticket = await Ticket.create({
            title: title,
            description: description,
            priority: priority,
            departmentId: matchedID,
            createdBy: createdBy,
            status: "QUEUED",
            priorityWeight: priorityWeight
        });

        emitQueueUpdated(matchedID);

        const ticketassign = await tryAssignTicket(createticket._id, matchedID);
        const finalTicket = ticketassign || createticket;
        res.status(201).json({
            success: true,
            message: "Ticket Created Successfully",
            finalTicket
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
}

export const getAllTickets = async (req, res) => {

    try {
        let filter = {};
        if (req.user.role === "department_admin") {
            filter.departmentId = req.user.departmentId;
        }

        if (req.user.role === "user") {
            filter.createdBy = req.user._id;
        }

        const alltickets = await Ticket.find(filter);
        if (alltickets.length == 0) {
            console.log("No record find");
            return res.status(404).json({
                success: false,
                message: "No record Find"
            });
        }

        console.log("Successfully Fetched All Documents");
        return res.status(200).json({
            success: true,
            message: "Successfully Fetched All Documents",
            alltickets
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
}

export const getTicketById = async (req, res) => {

    try {
        const { id } = req.params;
        if (!id) {
            console.log("id needed");
            return res.status(400).json({
                success: false,
                message: "id needed"
            });
        }

        const ticket = await Ticket.findById(id);
        if (!ticket) {
            console.log("No record find");
            return res.status(404).json({
                success: false,
                message: "No record Find"
            });
        }

        if (req.user.role === "department_admin" && ticket.departmentId.toString() !== req.user.departmentId.toString()) {
            console.log("Unauthorized");
            return res.status(403).json({
                success: false,
                message: "Unauthorized"
            });
        }

        if (req.user.role === "user" && ticket.createdBy.toString() !== req.user._id.toString()) {
            console.log("Unauthorized");
            return res.status(403).json({
                success: false,
                message: "Unauthorized"
            });
        }

        console.log("Successfully Fetched All Documents");
        return res.status(200).json({
            success: true,
            message: "Successfully Fetched All Documents",
            ticket
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
}

export const updateTicket = async (req, res) => {

    try {
        const { id } = req.params;
        const { newstatus } = req.body;
        if (!id) {
            console.log("id needed");
            return res.status(400).json({
                success: false,
                message: "id needed"
            });
        }

        if (!newstatus) {
            console.log("newStatus is required");
            return res.status(400).json({
                success: false,
                message: "newStatus is required"
            });
        }

        const ticket = await Ticket.findById(id);
        if (!ticket) {
            console.log("No record find");
            return res.status(404).json({
                success: false,
                message: "No record Find"
            });
        }

        const oldStatus = ticket.status;

        const validStatuses = ["OPEN", "QUEUED", "ASSIGNED", "IN_PROGRESS", "WAITING_FOR_USER", "RESOLVED", "CLOSED"]
        if (!validStatuses.includes(newstatus)) {
            console.log("No inclueded status");
            return res.status(400).json({
                success: false,
                message: "No inclueded status"
            });
        }

        if (req.user.role === "user") {
            console.log("Unauthorized");
            return res.status(403).json({
                success: false,
                message: "Unauthorized"
            });
        }

        if (req.user.role === "department_admin" && ticket.departmentId.toString() !== req.user.departmentId.toString()) {
            console.log("Unauthorized");
            return res.status(403).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const updateFields = {
            status: newstatus
        };

        if (newstatus == "RESOLVED" || newstatus == "CLOSED") {
            updateFields.resolvedAt = new Date();
        }

        const update = await Ticket.findByIdAndUpdate(id,
            updateFields ,
             {returnDocument: "after"} );

        const ticketlog = await TicketLog.create({
            ticketId: id,
            oldStatus: oldStatus,
            newStatus: newstatus,
            changedBy: req.user._id
        });


        if (newstatus == "RESOLVED" || newstatus == "CLOSED") {
            emitTicketResolved(ticket.createdBy.toString(), update);
            emitQueueUpdated(ticket.departmentId);
            const checkstatus = await Ticket.findOne({
                departmentId: ticket.departmentId,
                status: "QUEUED"
            }).sort({ priorityWeight: -1, createdAt: 1 });

            if (checkstatus) {
                await tryAssignTicket(checkstatus._id, checkstatus.departmentId);
            }
        }


        console.log("Successfully update the document");
        return res.status(200).json({
            success: true,
            message: "Successfully update the document",
            title: update.title,
            description: update.description,
            priority: update.priority,
            departmentId: update.departmentId,
            assignedTo: update.assignedTo,
            status: update.status
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
}

export const getDepartmentQueue = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            console.log("id is missing");
            return res.status(400).json({
                success: false,
                message: "id is missing"
            });
        }

        const ticket = await Ticket.find({ departmentId: id, status: "QUEUED" }).sort({ priorityWeight: -1, createdAt: 1 });
        if (ticket.length == 0) {
            console.log("no record found");
            return res.status(404).json({
                success: false,
                message: "no record found"
            });
        }

        console.log("All Records fetched successfully");
        res.status(200).json({
            success: true,
            message: "All Records fetched successfully",
            ticket
        });

    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
}

export const getDashboard = async(req,res) =>
{
    try
    {
        const openTickets = await Ticket.countDocuments({
            status:{$in: ["QUEUED", "ASSIGNED", "IN_PROGRESS", "WAITING_FOR_USER"]}
        });

        const startofDay = new Date();
        startofDay.setHours(0,0,0,0);
        const endofDay = new Date();
        endofDay.setHours(23,59,59,999);

        const closedToday = await Ticket.countDocuments({
            status:{$in: ["RESOLVED", "CLOSED"]},
            resolvedAt:{$gte: startofDay, $lte: endofDay}
        });

        const queueLength = await Ticket.countDocuments({
            status: "QUEUED"
        });

        const availableAdmins = await Client.countDocuments({
            role: "department_admin",
            status: "online"
        });

        const resolvedTickets = await Ticket.find({
            status: {$in: ["RESOLVED", "CLOSED"]}
        });

        let totalTime = 0;
        
        for(const resolve of resolvedTickets)
        {
            totalTime = totalTime + (resolve.resolvedAt - resolve.createdAt);
        }

        let avgResolutionTime

        if(resolvedTickets.length == 0)
        {
           avgResolutionTime = 0;
        }
        else
        {
            avgResolutionTime = totalTime / resolvedTickets.length;
        }

        console.log("department admin dashboard");
        res.status(200).json({
            success: true,
            message: "department admin dashboard",
            openTickets,
            closedToday,
            queueLength,
            availableAdmins,
            avgResolutionTime
        });
        
}
    catch(err)
    {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "SERVER ERROR"
        });
    }
}