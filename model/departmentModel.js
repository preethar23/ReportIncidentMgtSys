import mongoose from "mongoose"

const departmentSchema = mongoose.Schema({
    name:
    {
        type:String,
        unique:true
    },
    keywords:
    {
        type: [String]
    }
},{timestamps: true});

export default mongoose.model("Department",departmentSchema);