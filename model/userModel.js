import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    name:
    {
        type:String,
        trim:true
    },
    email:
    {
        type:String,
        required:true,
        unique:true
    },
    password:
    {
        type:String,
        required:true
    },
    role:
    {
        type:String,
        enum:["user","department_admin","super_admin"],
        required: true
    },
    departmentId:
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Department"
    },
    status:
    {
        type:String,
        enum:["online","offline","busy","break"]
    },
    workingHours:
    {
       start: { type:String},
       end: { type:String}
    }
},
{timestamps:true});

export default mongoose.model("User",userSchema);