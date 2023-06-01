const mongoose = require('mongoose');

const msgSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    likes: {
        like: {
            type: Number,
            default: 0
        },
        love: {
            type: Number,
            default: 0
        },
        dislike: {
            type: Number,
            default: 0
        },
        loveState:{
            type:Boolean,
            default:false
        },
        likeState:{
            type:Boolean,
            default:false
        },
        dislikeState:{
            type:Boolean,
            default:false
        }
    },
    user: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: "UserSchema"
    }
    ,
    createdAT: {
        type: Date,
        default: Date.now
    }
}, { collection: 'messages' })

msgSchema.methods.addUniqueId = async () => {
    msgSchema.updateOne({ _id: _id }, { id: 1 })
}
const Message = mongoose.model("MSG", msgSchema)

module.exports = Message;