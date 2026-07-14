import Department from "../model/departmentModel.js"


export const createDepartment = async(req,res)=>
{
    try
    {
       const {name, keywords} = req.body;
       if(!name)
       {
        console.log("Department name is missing");
        return res.status(400).json({success:false,message:"missing name"})
       }

       const department = await Department.create({name,keywords});
       res.status(201).json({success:true, message:"Department created successfully", department});
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({success:false,message:err.message});
    }
}

export const getAllDepartment = async(req,res) =>
{
    try
    {
        const departments = await Department.find();
        if(departments.length == 0)
        {
            return res.status(404).json({success:false, message:"no department found"});
        }
        res.status(200).json({success:true, message:"Departments fetched successfully", departments});
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({success:false,message:err.message});
    }
}

export const getDepartmentById = async(req,res) =>
{
    try
    {
        const {id} =req.params;
        if(!id)
        {
           console.log("ID is missing");
           return res.status(404).json({success:false,message:"ID missing"})
        }

        const department = await Department.findById(id);
        if(!department)
        {
           console.log("Department does not exist");
           return res.status(404).json({success:false,message:"not found"})
        }
        res.status(200).json({success:true, message:"Departments fetched successfully", department});
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({success:false,message:err.message});
    }
}

export const updateDepartment = async(req,res) =>
{
    try
    {
        const {id} =req.params;
        const {name,keywords} = req.body;
        if(!id)
        {
           console.log("ID is missing");
           return res.status(400).json({success:false,message:"ID missing"})
        }

        const existdepartment = await Department.findById(id);
        if(!existdepartment)
        {
           console.log("Department does not exist");
           return res.status(404).json({success:false,message:"not found"})
        }

        const updateField = {};
        if(name)
        {
           updateField.name = name;
        }
        if(keywords)
        { 
           updateField.keywords = keywords
        }

        const department = await Department.findByIdAndUpdate(id,updateField,{returnDocument: "after"});
        res.status(200).json({success:true, message:"Departments updated successfully", department});
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({success:false,message:err.message});
    }
}

export const deleteDepartment = async(req,res) =>
{
    try
    {
        const {id} =req.params;
        if(!id)
        {
           console.log("ID is missing");
           return res.status(400).json({success:false,message:"ID missing"})
        }

        const existdepartment = await Department.findById(id);
        if(!existdepartment)
        {
           console.log("Department does not exist");
           return res.status(404).json({success:false,message:"not found"})
        }

        await Department.findByIdAndDelete(id);
        res.status(200).json({success:true, message:"Departments deleted successfully"});
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({success:false,message:err.message});
    }
}