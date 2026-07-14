import cron from "node-cron"
import Department from "../model/departmentModel.js"
import {tryAssignTicket} from "../services/assignmentService.js"
import Ticket from "../model/ticketModel.js"


export const runScheduler = async() =>
{
    try
    {
       const department = await Department.find();
       if(department.length == 0)
       {
          console.log("No department found");
       }

       for(const dept of department)
       {
          const nextticket = await Ticket.findOne({
            departmentId: dept._id,
            status: "QUEUED"
          }).sort({priorityWeight: -1, createdAt: 1});

          if(nextticket)
          {
            await tryAssignTicket(nextticket._id, nextticket.departmentId);
          }
       }
    }
    catch(err)
    {
        console.log(err);
    }
}


cron.schedule("* * * * *", runScheduler);