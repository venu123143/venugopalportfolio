const express = require('express');
const router = express.Router();
const crypto = require('crypto')
const bcrypt = require('bcrypt');
const authenticate = require("../middlewares/Authenticate")
require('../DB/conn') // connection to mongodb
const User = require("../model/User") // get schema
const Message = require("../model/Message")
const features = require("../Utils/features")
const sendToken = require('../Utils/JwtToken')
const ImageStorage = require('../middlewares/ImageStorage');
// validations
const { check, validationResult } = require('express-validator');
router.get('/', (req, res) => {
    res.send("helo world from servernode")
})

// register(async - await)
router.post('/register', check('username').isLength({ min: 3, max: 16 }).custom(value => !/\s/.test(value)),
    check('emailid').isEmail().normalizeEmail(),
    check('password').isLength({ min: 8, max: 20 }),
    check('phoneno').isLength({ min: 10, max: 10 }),
    async (req, res) => {
        const { username, phoneno, emailid, password, confirmPassword, gender } = req.body;
        if (!username || !phoneno || !emailid || !password || !confirmPassword || !gender) {
            return res.status(422).json({ error: "plz fill the fields properly" })
        }
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ error: "Enter the Username, Email and Phone No fields properly" })
        }
        try {
            const existUser = await User.findOne({ emailid: emailid, phoneno: phoneno });
            if (existUser) {
                return res.status(422).json({ error: "email or phone already exists" })
            } else if (password !== confirmPassword) {
                return res.status(422).json({ error: "passoword and cpassword are not same" })

            } else {
                const user = new User({ username, phoneno, emailid, password, confirmPassword, gender })
                console.log(user);
                user.save();
                return res.status(201).json({ error: "user registration sucessful" })
            }
        } catch (err) {
            return res.status(401).json("user failed to register..!, try again");
        }

    })
// login(async - await)
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        if (!username || !password) {
            return res.status(400).json({ msg: "plz fill the data" })
        }
        // fetch data from mongodb database (it might be null too if mismatch with db )
        const loginUser = await User.findOne({ username: username })
        if (!loginUser) {
            return res.status(401).json({ msg: "username incorrect or not registered" })
        }
        // only works for encrypted passwords
        const isMatch = await bcrypt.compare(password, loginUser.password);
        if (!isMatch) {
            return res.status(401).json({ msg: "password incorrect" })
        }
        return sendToken(loginUser, 200, res);
    } catch (error) {
        console.log(error);
    }
})

router.post('/loginviaotp', async (req, res) => {
    const { phoneno } = req.body;
    const num = phoneno.slice(2,);
    const user = await User.findOne({ phoneno: num })
    if (user) {
        res.status(200).send(user)
    }
    else {
        res.status(401).send("user not found")
    }
})

// logout cookie
router.get('/logout', async (req, res) => {
    res.clearCookie('jwtoken', { path: '/' })
    res.status(200).send('user logged Out')
})

router.post('/forgotpassword', async (req, res) => {
    const user = await User.findOne({ emailid: req.body.emailid })
    if (!user) {
        return res.status(404).send("user not found")
    }
    // get reset password token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false })
    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/reset/:${resetToken}`

    const message = `your password reset token is:- \n\n ${resetPasswordUrl} \n\n if you have not 
    requested this email please ignore it..`

    try {
        const mail = sendEmail({
            emailid: user.emailid,
            subject: "reset password recovery",
            message: message
        })
        console.log(mail);
        res.status(200).json({ msg: `email sent to ${user.emailid} sucessfully`, token: resetPasswordUrl });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined
        await user.save({ validateBeforeSave: false })
        return Error("email not sent..!")
    }
})
router.put('/reset:token', async (req, res) => {
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex")
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })
    if (!user) {
        return res.status(400).send("reset password token is invalid or has been expired")
    }
    if (req.body.password !== req.body.confirmPassword) {
        return res.status(400).send("password does not match")
    }
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.save();
})
// about us page verification using cookie.
router.get('/about', async (req, res) => {
    res.json({ msg: "about called" });
    // res.status(200).send(req.rootUser)
})

// post contact details.
router.post('/contact', async (req, res) => {
    const { name, email, message } = req.body
    if (!name || !email || !message) {
        return res.status(402).json({ error: "plz fill the field properly" })
    }
    try {
        const UserExist = await User.findOne({ emailid: email })
        // console.log(UserExist);
        if (UserExist) {
            const msg = new Message({ name, email, message, user: UserExist._id })
            msg.save();
            return res.status(200).json({ error: "msg sent sucessfully..!" })
        } else {
            return res.status(422).json({ error: "please register your account first" })
        }
    } catch (err) {
        return res.status(422).json({ error: "user doesnot exist." })
    }
})


router.get('/skills', async (req, res) => {
    loginUser = await User.findOne({ username: "VENU123100" })
    if (loginUser) {
        const cookie = await loginUser.generateAuthToken();
        res.cookie("jwtoken", cookie, {
            maxAge: 180000,
            httpOnly: true
        })
        res.json({ token: "skills page okk..!" })
    } else {
        console.log("user not present with username provided");
    }
})
// sortdata
router.get('/sortdata', async (req, res) => {
    const resultPerPage = 9;
    const currentPage = Number(req.query.page) || 1;
    const qry = req.query.likes
    const skip = resultPerPage * (currentPage - 1);
    const data = await Message.find().sort({ [`likes.${qry}`]: -1 }).limit(resultPerPage).skip(skip)
    res.send(data)
})
router.get('/sortdate', async (req, res) => {
    const resultPerPage = 9;
    console.log(Number(req.query.page))
    const currentPage = Number(req.query.page) || 1;
    const qry = req.query.date
    console.log(qry);
    const skip = resultPerPage * (currentPage - 1);
    const data = await Message.find().sort({ [`${qry}`]: -1 }).limit(resultPerPage).skip(skip)
    res.send(data)

})
// lets-talk --get all data
router.get('/letstalk', async (req, res) => {
    const resultPerPage = 9;
    const productcount = await Message.countDocuments();
    const apifeature = new features(Message.find(), req.query)
        .search()
        .filter()
        .pagination(resultPerPage);
    const messages = await apifeature.query
    const pagecount = Math.ceil(productcount / resultPerPage);
    res.status(200).send([messages, pagecount, resultPerPage])
})
// lets love symbol
router.get('/love/:id', async (req, res) => {
    const urlId = req.params.id
    const post = await Message.findById(req.params.id)
    const state = post.likes.loveState
    if (state) {
        await Message.updateOne({ _id: urlId }, { "likes.loveState": false, $inc: { "likes.love": -1 } })
    } else {
        await Message.updateOne({ _id: urlId }, { "likes.loveState": true, $inc: { "likes.love": 1 } })
    }
    // const ans = await Message.find({});
    const resultPerPage = 9;
    const apifeature = new features(Message.find(), req.query)
        .search()
        .filter()
        .pagination(resultPerPage);
    const messages = await apifeature.query
    res.send(messages)
})
// for likes symbol
router.get('/like/:id', async (req, res) => {
    const urlId = req.params.id;
    const post = await Message.findById(req.params.id)
    const likestate = post.likes.likeState;
    const dislikestate = post.likes.dislikeState;
    if (likestate) {
        await Message.updateOne({ _id: urlId }, { "likes.likeState": false, $inc: { "likes.like": -1 } })
    }
    else if (likestate || dislikestate) {
        await Message.updateOne({ _id: urlId }, { "likes.likeState": true, "likes.dislikeState": false, $inc: { "likes.like": 1, "likes.dislike": -1 } })
    } else {
        await Message.updateOne({ _id: urlId }, { "likes.likeState": true, $inc: { "likes.like": 1 } })
    }
    // const ans = await Message.find({})
    // res.send(ans)
    const resultPerPage = 9;
    const apifeature = new features(Message.find(), req.query)
        .search()
        .filter()
        .pagination(resultPerPage);
    const messages = await apifeature.query
    res.send(messages)
})
// for dislike symbol
router.get('/dislike/:id', async (req, res) => {
    const urlId = req.params.id;
    const post = await Message.findById(req.params.id);
    const likestate = post.likes.likeState;
    const dislikestate = post.likes.dislikeState;
    if (dislikestate) {
        await Message.updateOne({ _id: urlId }, { "likes.dislikeState": false, $inc: { "likes.dislike": -1 } })
    }
    else if ((likestate || dislikestate)) {
        await Message.updateOne({ _id: urlId }, { "likes.likeState": false, "likes.dislikeState": true, $inc: { "likes.like": -1, "likes.dislike": 1 } })
    } else {
        await Message.updateOne({ _id: urlId }, { "likes.dislikeState": true, $inc: { "likes.dislike": 1 } })
    }
    const resultPerPage = 9;
    const apifeature = new features(Message.find(), req.query)
        .search()
        .filter()
        .pagination(resultPerPage);
    const messages = await apifeature.query
    res.send(messages)
})


// delete message
router.delete(`/deletemsg/:id`, async (req, res) => {
    const id = req.params.id
    const del = await Message.deleteOne({ _id: id });
    const resultPerPage = 9;
    const apifeature = new features(Message.find(), req.query)
        .search()
        .filter()
        .pagination(resultPerPage);
    const messages = await apifeature.query
    return res.status(200).send({ error: "Message deleted sucessfully.", data: messages })
})

// image - upload
router.post('/upload', authenticate, (req, res) => {
    ImageStorage.single("file")(req, res, (err) => {
        if (req.file === undefined) {
            return res.send("must need a image")
        }
        if (err) {
            console.log(err);
        } else {
            const imageUrl = `http://localhost:5000/upload/${req.file.filename}`
            User.updateOne({ _id: req.userId }, { "image.data": imageUrl, "image.contentType": 'image/jpg' })
                .then(() => res.send("user uploaded"))
                .catch((err) => res.send(err))
        }
    })
})



module.exports = router