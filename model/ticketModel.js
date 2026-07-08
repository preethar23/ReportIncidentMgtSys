import mongoose from "mongoose"

const ticketSchema = mongoose.Schema({
    title:
    {
        type:String,
        required:true
    },
    description:
    {
        type:String
    },
    priority:
    {
        type:String,
        enum:["critical","high","medium","low"],
        default:"medium"
    },
    departmentId:
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Department"
    },
    assignedTo:
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    status:
    {
        type:String,
        enum:["OPEN","QUEUED","ASSIGNED","IN_PROGRESS","WAITING_FOR_USER","RESOLVED","CLOSED"],
        default: "OPEN"
    },
    createdBy:
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
},
{timestamps: true});

export default mongoose.model("Ticket", ticketSchema);