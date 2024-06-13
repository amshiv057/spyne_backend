const userStatus = require("../../../enums/userStatus");
const userType = require("../../../enums/userType");
const userModel = require("../../../models/user");
const userServices = {
    createUser: async (insertObj) => {
        return await userModel.create(insertObj);
    },
    checkEmailMobileExist: async (mobile_number, email, id) => {
        console.log(mobile_number, email, id)
        let query = { $and: [{ $or: [{ email: email }, { mobile_number: mobile_number }, { _id: { $ne: id } }] }] }
        return await userModel.findOne(query);
    },
    findUser: async (query) => {
        return await userModel.findOne(query);
    },
    findUserByuserId: async (query) => {
        return await userModel.findOne(query);
    },
    updateUser: async (query, obj) => {
        return await userModel.updateOne(query, obj, { new: true })
    },

    findUserList: async (validateBody)=>{
        let query = {userType:userType.user,userStatus:{$ne:userStatus.delete}};
        const {search,page,limit} = validateBody;
        if(search){
            query.$or =[
                {name:{$regex:search,options:'i'},}
            ]
        }
        let options ={
            page:parseInt(page) || 1,
            limit:parseInt(limit)||10,
            sort:{createdAt:-1},
            select:"email ,name, mobile_number"
        };
        return await userModel.paginate(query,options);
    }
}

module.exports = { userServices };