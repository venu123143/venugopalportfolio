const User = require('../model/User');

const authorizePerson = (...roles) => {
    return (req,res,next)=>{
        if(!roles.includes(req.User.role))
        {
            return next(res.status(403).json({err:`Role : ${req.User.role} is not allowed to access this page`}));
        }
        next();
    }
}
module.exports = authorizePerson;