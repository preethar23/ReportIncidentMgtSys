import Client from "../model/userModel.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"


export const register = async(req,res) =>
{
    try
    {
       const {name, email, password} = req.body;
       if(!name || !email || !password)
       {
        console.log("All feilds are required");
        return res.status(400).json({
            success:false,
            messgage: "all feilds are required"
        });
       }

       const existUser = await Client.findOne({email:email});
       if(existUser)
       {
        console.log("user already exist");
        return res.status(400).json({
            success:false,
            messgage: "user already exist"
        });
       }

       const hashedPassword = await bcrypt.hash(password,10);

       const user = await Client.create({
        name:name,
        email:email,
        password:hashedPassword,
        role:"user"
       });

       res.status(201).json({
        success:true,
        message: "user register successfully",
        name:user.name,
        email:user.email,
        role:user.role
       });
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({
            success:false,
            messgage: err.message
        });
    }
}

const tokenGenerate = (userId) =>
{
    const AccessToken = jwt.sign(
        {userId: userId},
        process.env.ACCESS_TOKEN,
        {expiresIn: "20m"}
    );

    const RefreshToken = jwt.sign(
        {userId: userId},
        process.env.REFRESH_TOKEN,
        {expiresIn: "7d"}
    );

    return {AccessToken, RefreshToken}
}

export const refreshAccessToken = async(req,res) =>
{
    try
    {
        const RefreshToken = req.cookies.RefreshToken;
        if(!RefreshToken)
        {
            console.log("No refersh token provided");
             return res.status(401).json({
            success:false,
            messgage: "No refresh token"
        });
        }

        const decoded = jwt.verify(RefreshToken, process.env.REFRESH_TOKEN);
        const userId = decoded.userId;
        const user = await Client.findById(userId);
        if(!user)
        {
            console.log("User not found");
            return res.status(404).json({
            success:false,
            messgage: "User not found"
            });
        }

        if(user.refreshToken !== RefreshToken)
        {
            res.clearCookie("RefreshToken",{
                httpOnly:true,
                path:"/",
                secure:true
            });
            return res.status(403).json({
            success: false,
            message:"Invalid RefreshToken"
        })
        }

        const newAccesstoken = jwt.sign(
            {userId: userId},
            process.env.ACCESS_TOKEN,
            {expiresIn: "20m"}
        );

        res.status(200).json({
            success: true,
            message:"new Access Token generated successfully",
            newAccesstoken
        });
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({
            success:false,
            messgage: err.message
        });
    }
}

export const login = async(req,res) =>
{
    try
    {
       const {email, password} = req.body;
       if(!email || !password)
       {
        console.log("All feilds are required");
        return res.status(400).json({
            success:false,
            messgage: "all feilds are required"
        });
       }
        
       const existuser = await Client.findOne({email: email});
       if(!existuser)
       {
        console.log("Email not found");
        return res.status(404).json({
            success:false,
            messgage: "user do not exist"
        });
       }

       const newPassword = await bcrypt.compare(password, existuser.password);
       if(!newPassword)
       {
        console.log("incorrect password");
        return res.status(404).json({
            success:false,
            messgage: "Enter Correct Password"
        });
       }

       const {AccessToken, RefreshToken} = tokenGenerate(existuser._id);
       existuser.refreshToken = RefreshToken;
       existuser.lastLoginAt = new Date();
       
       await existuser.save();

       res.cookie("RefreshToken", RefreshToken,{
        httpOnly: true,
        secure:true,
        sameSite:"strict",
        path:"/",
        maxAge: 7*24*60*60*1000,
       });

       res.status(200).json({
        success: true,
        message: "Login Successfully",
        AccessToken
       });


    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({
            success:false,
            messgage: err.message
        });
    }
}

export const logout = async(req,res) =>
{
    try
    {
        const RefreshToken = req.cookies.RefreshToken;
        if(!RefreshToken)
        {
            console.log("No refersh token provided");
            return res.status(401).json({
            success:false,
            messgage: "No refresh token"
        });
        }
        let decoded;
       try
       {
           decoded = jwt.verify(RefreshToken, process.env.REFRESH_TOKEN);
       }
       catch(err)
       {
            res.clearCookie("RefreshToken",{
            httpOnly:true,
            path:"/",
            secure:true
            });
            return res.status(403).json({
            success: false,
            message:"Invalid RefreshToken"
            });
       }

       const userId = decoded.userId;
        const user = await Client.findById(userId);
        if(!user)
        {
            console.log("User not found");
            return res.status(404).json({
            success:false,
            messgage: "User not found"
            });
        }

        if(user.refreshToken !== RefreshToken)
        {
            res.clearCookie("RefreshToken",{
                httpOnly:true,
                path:"/",
                secure:true
            });
            return res.status(403).json({
            success: false,
            message:"Invalid RefreshToken"
        })
        }

        user.refreshToken = null;
        await user.save();

        res.clearCookie("RefreshToken",{
                httpOnly:true,
                path:"/",
                secure:true
        });


         res.status(200).json({
            success: true,
            message:"logout successfully"
    });

}
    catch(err)
    {
        console.log(err);
        res.status(500).json({
            success:false,
            messgage: err.message
        });
    }
}

export const createDepartmentAdmin = async(req,res) =>
{
    try
    {
       const {name, email, password, departmentId} = req.body;
       if(!name || !email || !password || !departmentId)
       {
        console.log("All feilds are required");
        return res.status(400).json({
            success:false,
            messgage: "all feilds are required"
        });
       }

       const existUser = await Client.findOne({email:email});
       if(existUser)
       {
        console.log("user already exist");
        return res.status(400).json({
            success:false,
            messgage: "user already exist"
        });
       }

       const hashedPassword = await bcrypt.hash(password, 10);

       const user = await Client.create({
        name:name,
        email:email,
        password:hashedPassword,
        role:"department_admin",
        departmentId:departmentId
       });

        res.status(201).json({
        success:true,
        message: "user register successfully",
        name:user.name,
        email:user.email,
        role:user.role,
        departmentId:user.departmentId
       });

    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({
            success:false,
            messgage: err.message
        });
    }
}