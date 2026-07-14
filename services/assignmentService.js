import Client from "../model/userModel.js"
import Ticket from "../model/ticketModel.js"
import {emitNewTicket,emitQueueUpdated} from "../sockets/ticketEvents.js"


export const findEligibleAdmins = async(departmentId) =>
{
    try
    {
        const user = await Client.find({
            role:"department_admin",
            departmentId: departmentId,
            status:"online"
        });
        return user;
    }
    catch(err)
    {
        console.log(err);
    }
}

export const pickBestAdmin = async(adminsList) =>
{
    try
    {
       if(adminsList.length == 0)
        {
            return null;
        }
        
        let bestAdmin = null;
        for(const admin of adminsList)
        {
            const count = await Ticket.countDocuments({
                assignedTo : admin._id,
                status: {$in: ["ASSIGNED", "IN_PROGRESS"]}
            });

            if(count == 0)
            {
                bestAdmin = admin;
                 return bestAdmin;
            }
        }
        return null;
       
    }
    catch(err)
    {
        console.log(err)
    }
        
}

export const assignTicket = async(ticketId, adminId) =>
{
    try
    {
        const ticket = await Ticket.findByIdAndUpdate(ticketId,
        { assignedTo: adminId,
        status:"ASSIGNED"},
        {returnDocument: "after"});

        emitNewTicket(adminId, ticket);
        emitQueueUpdated(ticket.departmentId);

        return ticket;
    }
    catch(err)
    {
        console.log(err);
    }
      
}

export const tryAssignTicket = async(ticketId, departmentId) =>
{
    try
    {
        const eligibleAdmins = await findEligibleAdmins(departmentId);
        const chosenAdmin = await pickBestAdmin(eligibleAdmins);
        if(!chosenAdmin)
        {
            return null;
        }

        const assignticket = await assignTicket(ticketId, chosenAdmin._id);
        return assignticket;
    }
    catch(err)
    {
        console.log(err);
    }
   
}