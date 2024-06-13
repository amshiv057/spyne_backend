const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
import cloudinary from "cloudinary";
require("../../config/config");
const saltRounds = 10;
cloudinary.config({
    cloud_name: global.gConfig.cloudinary.cloud_name,
    api_key: global.gConfig.cloudinary.api_key,
    api_secret: global.gConfig.cloudinary.api_secret
})


module.exports = {
    createHash: (password) => {
        return bcrypt.hashSync(password, saltRounds);
    },
    compareHash: (password, hashedPassword) => {
        return bcrypt.compare(password, hashedPassword);
    },
    getOtp: () => {
        return Math.floor(100000 + Math.random() * 90000);
    },
    getToken: (payload) => {
        return jwt.sign(payload, global.gConfig.jwtsecret, { expiresIn: '24h', });
    },
    getSecureUrl: async (files) => {
        var result = await cloudinary.v2.uploader.upload(files[0].path,{ resource_type: "auto" });
        // console.log("result>>>>>>>",result)
        return result.secure_url;
    }

}


// const hashPassword = function (password){
//     return bcrypt.hashSync(password, saltRounds);
// }

// console.log(hashPassword("Admin@7169"));