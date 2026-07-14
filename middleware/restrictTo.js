export const restrictTo = (...allowedRoles) =>
{
   return (req,res, next) =>
   {
    const role = allowedRoles.includes(req.user.role);
    if(!role)
    {
        return res.status(403).json({
            success: false,
            message:"You are not Allowed"
        });
    }
    next();
   }
}