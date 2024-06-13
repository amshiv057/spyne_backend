const mongoose = require("mongoose");
import mongoosePaginate from "mongoose-paginate-v2";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import userStatus from "../enums/userStatus";
const userType = require("../enums/userType");
const timeStamps = {
   timestamps: true,
   collection: 'user'
}
const userSchema = new mongoose.Schema({
   name: {
      type: String,
   },
   email: {
      type: String,
      required: true
   },
   mobile_number: {
      type: String,
   },
   password: {
      type: String,
      required: true
   },
   userType: {
      type: String,
      default: userType.user,
      enum: [userType.admin, userType.user]
   },
   userStatus: {
      type: String,
      default: userStatus.active,
      enum: [userStatus.active, userStatus.delete]
   },
   isEmail_Verified: {
      type: Boolean,
      default: false
   },
   followers: {
      type: Array,
      default: []
   },
   followings:{
      type:Array,
      default:[]
   },
   otp: {
      type: Number
   },
   otp_time: {
      type: Date
   },

}, timeStamps);
userSchema.plugin(mongoosePaginate)
userSchema.plugin(mongooseAggregatePaginate)
module.exports = mongoose.model('user', userSchema);
