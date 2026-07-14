import {getIO} from "./socketInstance.js"


export const emitNewTicket = (adminId, ticket) =>
{
   const io = getIO();

   io.to(adminId.toString()).emit("new_ticket", ticket);
}

export const emitTicketResolved = (userId, ticket) =>
{
    const io = getIO();

    io.to(userId.toString()).emit("ticket_resolved", ticket);
}

export const emitQueueUpdated = (departmentId) =>
{
     const io = getIO();

     io.to(departmentId.toString()).emit("queue_updated");
}