// create token and save cookie
const sendToken = async (user, statuscode, res) => {
    const token = await user.generateAuthToken();
    const options = {
        httpOnly: true,
        maxAge: 360000,
    }

    res.status(statuscode).cookie('jwtoken', token, options).json({
        user:user,
        sucess: true,
        msg: "user logged in successfully",
    })
}
module.exports = sendToken;