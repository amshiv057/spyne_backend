import Joi from "joi";
import apiError from "../../../../helper/apiError";
import response from "../../../../../assets/response";
import responseMessage from "../../../../../assets/responseMessage";
import { postServices } from "../../services/post";
import { userServices } from "../../services/user";
import postStatus from "../../../../enums/postStatus";
import commentStatus from "../../../../enums/commentStatus";
const commonFunction = require("../../../../helper/utlis");
const { createPost, findPost, updatePost, findPostList } = postServices;
// const { createComment, findComment, updateComment } = commentServices;
const { findUser } = userServices;



class postController {
    /**
     * @swagger
     * /post/createPost:
     *   post:
     *     tags:
     *       - POST
     *     description: createPost
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: Token for authentication
     *         in: header
     *         required: true
     *       - name: text
     *         description: Caption for the post
     *         in: formData
     *         required: true
     *       - name: hashTags
     *         description: Caption for the post
     *         in: formData
     *         required: true
     *       - name: file
     *         description: Image for the post
     *         in: formData
     *         required: true
     *         type: file
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async createPost(req, res, next) {
        const validSchema = {
            text: Joi.string().required(),
            hashTags: Joi.string().required()
        }
        try {
            const value = await Joi.validate(req.body, validSchema);
            const userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            const file = req.files;
            const getUrl = await commonFunction.getSecureUrl(file);  // get secure url from cloudinary
            if (!getUrl) {
                throw apiError.internal(responseMessage.SOMETHING_WENT_WRONG);
            }
            const insertObj = {
                userId: userResult._id,
                text: value.text,
                hashTags: value.hashTags,
                postImage: getUrl
            };
            const postResult = await createPost(insertObj);
            return res.json(new response({}, responseMessage.POST_CREATED))
        } catch (error) {
            next(error);
        }
    }
/**
 * @swagger
 * /post/viewPost:
 *   get:
 *     tags: 
 *       - POST
 *     description: View a post
 *     parameters:
 *       - in: header
 *         name: token
 *         required: true
 *         description: Token for authentication
 *       - in: formData
 *         name: postId
 *         required: true
 *         description: ID of the post to view
 *     responses:
 *       200:
 *         description: Return the post data
 */
    async viewPost(req, res, next) {
        const validSchema = {
            postId: Joi.string().required()
        }
        try {
            const value = await Joi.validate(req.body, validSchema);
            console.log(value)
            console.log(req.userId)
            const userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            const postResult = await findPost({ _id: value.postId, status: { $ne: postStatus.delete } });
            if (!postResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND)
            }
            if (!postResult.views.includes(userResult._id)) {
                await updatePost({ _id: postResult._id }, { $push: { views: userResult._id } });
            }
            return res.json(new response(postResult, responseMessage.DATA_FOUND));
        } catch (error) {
            next(error)
        }
    }
    /**
     * @swagger
     * /post/postList:
     *   get:
     *     tags:
     *       - POST
     *     description: User Post List
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: Token for authentication
     *         in: header
     *         required: true
     *       - name: search
     *         description:  you can search post basis on text or hashTags
     *         in: formData,
     *         required: false
     *       - name: page
     *         description: page 
     *         in: formData
     *         required: false
     *       - name: limit
     *         description: limit
     *         in: formData
     *         required: false
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async postList(req, res, next) {
        const validSchema = {
            search:Joi.string().optional(),
            page: Joi.string().optional(),
            limit: Joi.string().optional()
        }
        try {
            const value = await Joi.validate(req.body, validSchema);
            const userResult = await findUser({ _id: req.userId});
            console.log(userResult); 
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            const userPostList = await findPostList(value);
            console.log(userPostList);
            if (!userPostList) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            return res.json(new response(userPostList, responseMessage.DATA_FOUND))
        } catch (error) {
            next(error)
        }
    }
/**
 * @swagger
 * /post/updatePost:
 *   put:
 *     tags:
 *       - POST
 *     description: updatePost
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: Token for authentication
 *         in: header
 *         required: true
 *       - name: postId
 *         description: PostId required
 *         in: formData
 *         required: true
 *       - name: postCaption
 *         description: Caption for the post
 *         in: formData
 *         required: true
 *       - name: file
 *         description: Image for the post
 *         in: formData
 *         required: true
 *         type: file
 *     responses:
 *       200:
 *         description: Returns success message
 */
    async updatePost(req, res, next) {
        const validSchema = {
            postId: Joi.string().required(),
            text: Joi.string().required(),
            hashTags: Joi.string().required()
        }
        try {
            const value = await Joi.validate(req.body, validSchema);
            const userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }

            const file = req.files;
            const getUrl = await commonFunction.getSecureUrl(file); // get secureUrl form cloudinary
            if (!getUrl) {
                throw apiError.internal(responseMessage.SOMETHING_WENT_WRONG);
            }
            const postResult = await findPost({ _id: value.postId, status: { $ne: postStatus.delete } });
            if (!postResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND)
            }
            const obj = {
                text: value.text,
                hashTags: value.hashTags,
                postImage: getUrl
            }
            const result = await updatePost({ _id: postResult._id }, obj);
            return res.json(new response({}, responseMessage.UPDATE_SUCCESS))
        } catch (error) {
            next(error);
        }
    }

    /**
     * @swagger
     * /post/deletePost:
     *   delete:
     *     tags:
     *       - POST
     *     description: deletePost
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: Token for authentication
     *         in: header
     *         required: true
     *       - name: postId
     *         description: PostId required
     *         in: formData
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async deletePost(req, res, next) {
        const validSchema = {
            postId: Joi.string().required(),
        }
        try {
            const value = await Joi.validate(req.body, validSchema);
            console.log(value);
            const userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            const postResult = await findPost({ _id: value.postId, status: { $ne: postStatus.delete } });
            if (!postResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND)
            }
            const result = await updatePost({ _id: postResult._id }, { status: postStatus.delete });
            return res.json(new response(responseMessage.DELETE_SUCCESS))
        } catch (error) {
            next(error)
        }
    }
/**
 * @swagger
 * /post/createComment:
 *   post:
 *     tags: 
 *      - POST
 *     description: Create a comment on a post
 *     parameters:
 *       - in: header
 *         name: token
 *         required: true
 *         description: Token for authentication
 *       - in: formData
 *         name: postId
 *         description: ID of the post to comment on
 *         required: true
 *         type: string
 *       - in: formData
 *         name: commentText
 *         description: Text of the comment
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Comment created successfully
 */
    async createComment(req, res, next) {
        const validSchema = {
            postId: Joi.string().required(),
            commentText: Joi.string().required()
        };
        try {
            const value = await Joi.validate(req.body, validSchema);
            const userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            const postResult = await findPost({ _id: value.postId, status: { $ne: postStatus.delete } });
            if (!postResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND)
            }
            const obj = {
                userId: userResult._id,
                commentText: value.commentText
            }
            const result = await updatePost({ _id: postResult._id }, { $push: { comment: obj } });
            return res.json(new response({}, responseMessage.COMMENT_SUCCESS));
        } catch (error) {
            next(error)
        }
    }

/**
 * @swagger
 * /post/likeComment:
 *   post:
 *     tags: 
 *       - POST
 *     description: Like a comment on a post
 *     parameters:
 *       - in: header
 *         name: token
 *         required: true
 *         description: Token for authentication
 *       - in: formData
 *         name: postId
 *         description: ID of the post containing the comment
 *         required: true
 *         type: string
 *       - in: formData
 *         name: commentId
 *         description: ID of the comment to like
 *         required: true
 *         type: string
 *     responses:
 *       '200':
 *         description: Comment liked successfully
 */
    async likeComment(req, res, next) {
        const validSchema = {
            postId: Joi.string().required(),
            commentId: Joi.string().required()
        };
        try {
            const value = await Joi.validate(req.body, validSchema);
            const userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            const postResult = await findPost({ _id: value.postId, postStatus: { $ne: postStatus.delete } });
            if (!postResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND)
            }
            const comment = postResult.comment.find(comment => comment._id.toString() === value.commentId);
            if (!comment) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            if (comment.likes.includes(userResult._id)) {
                throw apiError.alreadyExist(responseMessage.ALREADY_LIKE);
            }
            await updatePost({ _id: postResult._id, 'comment._id': value.commentId }, { $push: { 'comment.$.likes':userResult._id } });
            res.json(new response({},responseMessage.COMMENT_LIKE))
        } catch (error) {
            next(error);
        }
    }

    /**
     * @swagger
     * /post/updateComment:
     *   put:
     *     tags: 
     *       - POST
     *     description: Update a comment on a post
     *     parameters:
     *       - in: header
     *         name: token
     *         required: true
     *         description: Token for authentication
     *       - in: formData
     *         name: postId
     *         description: ID of the post containing the comment
     *         required: true
     *         type: string
     *       - in: formData
     *         name: commentId
     *         description: ID of the comment to update
     *         required: true
     *         type: string
     *       - in: formData
     *         name: commentText
     *         description: New text for the comment
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: Comment updated successfully
     */
    async updateComment(req, res, next) {
        const validSchema = {
            postId: Joi.string().required(),
            commentId: Joi.string().required(),
            commentText: Joi.string().required()
        };
        try {
            const value = await Joi.validate(req.body, validSchema);
            const userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            const postResult = await findPost({ _id: value.postId, postStatus: { $ne: postStatus.delete } });
            if (!postResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND)
            }
            const comment = postResult.comment.find(comment => comment._id.toString() === value.commentId);
            if (!comment) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            await updatePost({ _id: value.postId, 'comment._id': value.commentId }, { $set: { commentText: value.commentText } });
        } catch (error) {
            next(error)
        }
    }
    /**
 * @swagger
 * /post/replyComment:
 *   post:
 *     tags: 
 *       - POST
 *     description: Reply to a comment on a post
 *     parameters:
 *       - in: header
 *         name: token
 *         required: true
 *         description: Token for authentication
 *       - in: formData
 *         name: postId
 *         description: ID of the post containing the comment
 *         required: true
 *         type: string
 *       - in: formData
 *         name: commentId
 *         description: ID of the comment to reply to
 *         required: true
 *         type: string
 *       - in: formData
 *         name: text
 *         description: Text of the reply
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Reply added successfully
 */

    async replyComment(req, res, next) {
        const validSchema = {
            postId: Joi.string().required(),
            commentId: Joi.string().required(),
            text: Joi.string().required()
        };
        try {
            const value = await Joi.validate(req.body, validSchema);
            const userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            const postResult = await findPost({ _id: value.postId, postStatus: { $ne: postStatus.delete } });
            if (!postResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND)
            }
            const comment = postResult.comment.find(comment => comment._id.toString() === value.commentId);
            if (!comment) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            }
            await updatePost({ _id: value.postId, 'comment._id': value.commentId },
                { $push: { 'comment.$.replies': { userId: req.userId, text: value.text } } })
        } catch (error) {
            next(error);
        }
    }
    /**
 * @swagger
 * /post/deleteComment:
 *   delete:
 *     tags: 
 *       - POST
 *     description: Delete a comment on a post
 *     parameters:
 *       - in: header
 *         name: token
 *         required: true
 *         description: Token for authentication
 *       - in: formData
 *         name: postId
 *         description: ID of the post containing the comment
 *         required: true
 *         type: string
 *       - in: formData
 *         name: commentId
 *         description: ID of the comment to delete
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 */

    async deleteComment(req, res, next) {
        const validSchema = {
            postId: Joi.string().required(),
            commentId: Joi.string().required()
        };
        try {
            const value = await Joi.validate(req.body, validSchema);
            const userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            const postResult = await findPost({ _id: value.postId, status: { $ne: postStatus.delete } });
            if (!postResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND)
            }
            await updatePost({ _id: postId, 'comment._id': value.commentId }, { $set: { 'comment.$.commentStatus': commentStatus.delete } });
            return res.json(new response({}, responseMessage.DELETE_SUCCESS));
        } catch (error) {
            next(error)
        }
    }
    /**
    * @swagger
    * /post/likePost:
    *   put:
    *     tags: 
    *      - POST
    *     description: Like a post
    *     parameters:
    *       - in: header
    *         name: token
    *         required: true
    *         description: Token for authentication
    *       - in: formData
    *         name: postId
    *         description: ID of the post to like
    *         required: true
    *         type: string
    *     responses:
    *       200:
    *         description: Post liked successfully
    */

    async likePost(req, res, next) {
        const validSchema = {
            postId: Joi.string().required()
        };
        try {
            const value = await Joi.validate(req.body, validSchema);
            const userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            const postResult = await findPost({ _id: value.postId, status: { $ne: postStatus.delete } });
            if (!postResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND)
            }
            if (postResult.likes.includes(userResult._id)) {
                throw apiError.alreadyExist(responseMessage.ALREADY_LIKE)
            }
            await updatePost({ _id: postResult._id }, { $push: { 'likes': userResult._id } });
        } catch (error) {
            next(error)
        }
    }
    /**
 * @swagger
 * /post/viewsOnPost:
 *   get:
 *     tags: 
 *      - POST
 *     description: Get the number of views on a post
 *     parameters:
 *       - in: header
 *         name: token
 *         required: true
 *         description: Token for authentication
 *       - in: query
 *         name: postId
 *         required: true
 *         description: ID of the post to get views for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns the number of views on the post
 */
    async viewsOnPost(req, res, next) {
        const validSchema = {
            postId: Joi.string().required()
        };
        try {
            const value = await Joi.validate(req.body, validSchema);
            const userResult = await findUser({ _id: req.userId });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            const postResult = await findPost({ _id: value.postId, status: { $ne: postStatus.delete } });
            if (!postResult) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND)
            }
            const viewsTotal = await postResult.views.length();
            return res.json(new response(viewsTotal, responseMessage.DATA_FOUND));
        } catch (error) {
            next(error);
        }
    }
}

export default new postController();