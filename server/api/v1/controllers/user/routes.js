const Express = require('express');
import controller from "./controller"
const auth = require("../../../../helper/auth");
module.exports = Express.Router()
     .post('/createUser', controller.createUser)
     .put('/verifyOtp', controller.verifyOtp)
     .post('/resendOtp', controller.resendOtp)
     .post('/loginUser', controller.userLogin)
     .post('/forgetPassword', controller.forgetPassword)
     .put('/resetPassword', controller.resetPassword)
     .use(auth.verifyToken)
     .get('/getProfile', controller.getProfile)
     .put('/editProfile', controller.editProfile)
     .put('/followUser', controller.followUser)
     .delete('/deleteUser', controller.deleteUser)
     .get("/userList", controller.usersList)  