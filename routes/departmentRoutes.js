import express from "express"
import { createDepartment, getAllDepartment, getDepartmentById, updateDepartment, deleteDepartment } from "../controller/departmentController.js"

const departmentrouter = express.Router();

departmentrouter.post("/create", createDepartment);
departmentrouter.get("/getall", getAllDepartment);
departmentrouter.get("/getone/:id", getDepartmentById);
departmentrouter.patch("/update/:id", updateDepartment);
departmentrouter.delete("/delete/:id", deleteDepartment);

export default departmentrouter;