const mongoose = require('mongoose'); //database
const bcrypt = require('bcrypt')  //password encription
const jwt = require('jsonwebtoken')  //token  for cookie
const validator = require('validator')
const crypto = require('crypto')
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,

    },
    phoneno: {
        type: Number,
        required: true,

    },
    emailid: {
        type: String,
        required: true,
        validate: [validator.isEmail]

    },
    password: {
        type: String,
        required: true,

    },
    confirmPassword: {
        type: String,
        required: true,

    },
    gender: {
        type: String,
        required: true
    },
    image: {
        data: Buffer,
        contentType: String
    },
    role: {
        type: String,
        default: "user"
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ]
}, { collection: 'users' })

// hashing the password 
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 12)
        this.confirmPassword = await bcrypt.hash(this.confirmPassword, 12)
        console.log("calling pre method");
    }
    next();
})

// we are generating token
userSchema.methods.generateAuthToken = async function () {
    try {
        let cur_token = jwt.sign({ _id: this._id }, process.env.SECRET_KEY)
        this.tokens = this.tokens.concat({ token: cur_token })
        await this.save();
        return cur_token;
    } catch (error) {
        console.log(error);
    }
}

userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex");
    // hash and add to schema
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = Date.now() + 5 * 60 * 1000;
    return resetToken
}


const User = mongoose.model("USER", userSchema);
module.exports = User;


