import jwt from "jsonwebtoken"
import Client from "../../model/userModel.js"


export const socketAuth = async (socket, next) => {
    try {
        const token = socket.handshake.headers.token;
        if (!token) {
            console.log("Missing token");
            return next(new Error("Missing Token"));
        }

        const verifyToken = jwt.verify(token, process.env.ACCESS_TOKEN);
        if (!verifyToken) {
            console.log("Wrong Token");
            return next(new Error("Wrong Token"));
        }

        const user = await Client.findById(verifyToken.userId);
        socket.user = user;
        console.log(`[AUTH] succeed here is the userId ${socket.user._id}`);

        next();

    }
    catch (err) {
        console.log(err);
        return next(new Error("Server error"));
    }
}