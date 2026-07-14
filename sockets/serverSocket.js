import {Server} from "socket.io"
import { socketAuth } from "./middleware/socketauthMiddleware.js";
import { setIO } from "./socketInstance.js";

export const initSocket = (server) =>
{
    const io = new Server(server,{
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }}
    );

    io.use(socketAuth);

    io.on("connection", (socket) =>
    {
       console.log("A user Connected", socket.id);

       socket.join(socket.user._id.toString());
       if(socket.user.role == "department_admin")
       {
        socket.join(socket.user.departmentId.toString());
       }
    });

    setIO(io);
    return io;
}