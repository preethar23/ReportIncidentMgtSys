import mongoose from "mongoose"

const ticketlogSchema = mongoose.Schema({
    ticketId: 
    {
      type: mongoose.Schema.Types.ObjectId,
      ref:"Ticket"
    },
    oldStatus:
    {
        type:String
    },
    newStatus:
    {
        type:String
    },
    changedBy:
    {
       type: mongoose.Schema.Types.ObjectId,
       ref:"User"
    }
},
{timestamps: true});

export default mongoose.model("TicketLog", ticketlogSchema);