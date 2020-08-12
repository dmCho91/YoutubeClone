const mongoose = require('mongoose')
const Schema = mongoose.Schema

const likeShcema = mongoose.Schema({
    userId:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    commentId:{
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    },
    videoId:{
        type: Schema.Types.ObjectId,
        ref: 'Video'
    }
}, { timestamps: true })

const Like = mongoose.model('Like', likeShcema)

module.exports = { Like }