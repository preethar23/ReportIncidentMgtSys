import jwt from "jsonwebtoken"
import Client from "../model/userModel.js"

export const authMiddleware = async(req,res,next) =>
{
    try
    {
       const authtoken = req.headers.authorization;
       if(!authtoken)
       {
        return res.status(400).json({
            success:false,
            message:"Invalid Token"
        });
       }

       const token = authtoken.split(" ")[1];
       const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
       if(!decoded)
       {
        return res.status(403).json({
            success:false,
            message:"Invalid Token"
        });
       }

       const user = await Client.findById(decoded.userId);
       if(!user)
       {
        return res.status(404).json({
            success:false,
            message:"No user found"
        });
       }

       req.user = user;
       next();
    }
    catch(err)
    {
        return res.status(500).json({
            success:false,
            message:"Server error"
        });
    }
}