import mongoose from "mongoose";
import postStatus from "../enums/postStatus";
import commentStatus from "../enums/commentStatus";
import mongoosePaginate from "mongoose-paginate-v2";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
const postSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'user'
    },
    text: {
        type: String
    },
    postImage: {
        type: String
    },
    hashTags: {
        type: String
    },
    postStatus: {
        type: String,
        default: postStatus.active, enum: [postStatus.active, postStatus.delete]
    },
    comment: [{
        userId: {
            type: mongoose.Types.ObjectId,
            ref: 'user'
        },
        commentText: {
            type: String
        },
        commentStatus: {
            type: String,
            default: commentStatus.active, enum: [commentStatus.active, commentStatus.delete],
        },
        replies: [{
            userId: {
                type: mongoose.Types.ObjectId,
                ref: 'user'
            },
            text: {
                type: String
            }
        }],
        likes: [{
            type: mongoose.Types.ObjectId,
            ref: 'user'
        }]
    }],
    views: {
        type: Array,
        default: []
    },
    likes: {
        type: Array,
        default: []
    }

}, { timestamps: true, collection: 'post' });

postSchema.plugin(mongoosePaginate)
postSchema.plugin(mongooseAggregatePaginate)
module.exports = mongoose.model('post', postSchema);
