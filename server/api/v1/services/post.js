import postModel from "../../../models/post";
import postStatus from "../../../enums/postStatus";
const postServices = {
    createPost: async (insertObj) => {
        return await postModel.create(insertObj);
    },
    findPost: async (query) => {
        return await postModel.findOne(query).populate({path:'userId',select:'email name mobile_number'});
    },
    updatePost: async (query, obj) => {
        return await postModel.updateOne(query, obj, { new: true });
    },
    findPostList: async (validateBody) => {
       try {
        let query = { postStatus: { $ne: postStatus.delete } };
        const { search, page, limit } = validateBody;
        if (search) {
            query.$or = [
                { text: { $regex: search, options: 'i' } },
                { hashTags: { $regex: search, options: 'i' } }
            ]
        }
        let options = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            sort: { createdAt: -1 },
            populate:[{path:'userId', select:"name email mobile_number"}]
        };
        return await postModel.paginate(query, options);
       } catch (error) {
          console.error(error)
       }
    },
    deletePost: async (query) => {
        return await postModel.deleteOne(query);
    }
}

module.exports = { postServices }