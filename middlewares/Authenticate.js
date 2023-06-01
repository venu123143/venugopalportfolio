const jwt = require('jsonwebtoken');
const User = require('../model/User');

const Authenticate = async (req, res, next) => {
    try {
        const token = req.cookies.jwtoken;
        // console.log(token);
        const verifyToken = jwt.verify(token, process.env.SECRET_KEY)
        const rootUser = await User.findOne({ _id: verifyToken._id, "tokens.token": token });
        if (!rootUser) {
            throw new Error('User not found')
        }
        // console.log(rootUser.username,rootUser.password,rootUser.emailid);
        req.token = token;
        req.rootUser = rootUser;
        req.userId = rootUser._id;
        next();
    } catch (err) {
        console.log(err);
        res.status(401).status({ error: "Unauthorized: login is needed" })
    }
}
module.exports = Authenticate;
