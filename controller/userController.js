import Client from "../model/userModel.js"


export const updateStatus = async(req,res) =>
{
    try
    {
        const {status} = req.body;
        const id = req.user._id;
        if(!status)
        {
          console.log("Missing status");
          return res.status(400).json({
            success: false,
            message: "Missing status"
        });  
        }

        const includedStatus = ["online","offline","busy","break"];
        if(!includedStatus.includes(status))
        {
            console.log("Not matching status");
            return res.status(400).json({
            success: false,
            message: "status not found in array"
        });  
        }

        const user = await Client.findByIdAndUpdate(id,
            {status: status},
            {returnDocument: "after"}
        );
        console.log("Status updated Successfully");
        res.status(200).json({
            success: true,
            message: "Status updated Successfully",
            status: user.status
        });  
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "server error"
        });
    }

}