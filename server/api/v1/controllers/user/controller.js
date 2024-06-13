import Joi from "joi";
import apiError from "../../../../helper/apiError";
import response from "../../../../../assets/response";
import responseMessage from "../../../../../assets/responseMessage"
import userStatus from "../../../../enums/userStatus";
const { userServices } = require("../../services/user");
const { createUser, findUser, updateUser, findUserList } = userServices;
const commonFunction = require("../../../../helper/utlis");
const userType = require("../../../../enums/userType");
const { sendMail } = require("../../../../helper/mailer");

class userController {
  /**
   * @swagger
   * /user/createUser:
   *   post:
   *     tags:
   *       - USER
   *     description: createUser
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: name
   *         description: name
   *         in: formData
   *         required: true
   *       - name: email
   *         description: email
   *         in: formData
   *         required: true
   *       - name: mobile_number
   *         description: mobile_number
   *         in: formData
   *         required: true
   *       - name: password
   *         description: password
   *         in: formData
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async createUser(req, res, next) {
    const validSchema = {
      name: Joi.string().required(),
      email: Joi.string().required(),
      mobile_number: Joi.string().required(),
      password: Joi.string().required(),
    }
    // const requiredFields = ['name', 'email', 'mobile_number', 'password'];

    try {
      const value = await Joi.validate(req.body, validSchema); // validate body data
      // console.log(field => !Object.keys(value).includes(field));
      // console.log( requiredFields.filter(field=> !.includes(value)))
      // const missingFields = requiredFields.filter(field => !Object.keys(value).includes(field));  // check required field

      // if (missingFields.length > 0) {
      //   throw apiError.badRequest(`The following fields are required: ${missingFields.join(', ')}`);
      // }
      // 
      if (value.email && value.mobile_number) {
        const result = await findUser({ $and: [{ $or: [{ email: value.email }, { mobile_number: value.mobile_number }] }] });
        if (result) {
          if (value.email === result.email) {
            throw apiError.alreadyExist(responseMessage.EMAIL_EXIST);
          }
          else {
            throw apiError.alreadyExist(responseMessage.MOBILE_EXIST)
          }
        }
      }

      const hashedPassword = commonFunction.createHash(value.password); // Password hashing
      const otp = commonFunction.getOtp();
      const otp_time = new Date(new Date().setMinutes(new Date().getMinutes() + 2)).toISOString(); // otp time 2 minutes
      const insertObj = {
        name: value.name,
        email: value.email,
        mobile_number: value.mobile_number,
        password: hashedPassword,
        userType: userType.user,
        otp: otp,
        otp_time: otp_time,
      };
      await sendMail(value.email, otp);  // send otp on mail
      const result = await createUser(insertObj);
      return res.json(new response({}, responseMessage.USER_CREATED))
    } catch (error) {
      next(error);
    }
  }
  /**
   * @swagger
   * /user/verifyOtp:
   *   put:
   *     tags:
   *       - USER
   *     description: verify email OTP
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: email
   *         description: email
   *         in: formData
   *         required: true
   *       - name: otp
   *         description: otp
   *         in: formData
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async verifyOtp(req, res, next) {
    const validSchema = {
      email: Joi.string().required(),
      otp: Joi.string().required()
    }
    try {
      const value = await Joi.validate(req.body, validSchema);
      const userResult = await findUser({ email: value.email });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND)
      }
      if (new Date().getTime() > new Date(userResult.otp_time).getTime()) {  // otp expired
        throw apiError.notAllowed(responseMessage.OTP_EXPIRED);
      }
      if (value.otp != userResult.otp) {  // invalid otp
        throw apiError.notAllowed(responseMessage.INVALID_OTP)
      }
      const result = await updateUser({ email: userResult.email }, { isEmail_Verified: true, });
      return res.json(new response({}, responseMessage.OTP_VERIFIED));
    } catch (error) {
      next(error);
    }
  }

  /**
  * @swagger
  * /user/resendOtp:
  *   post:
  *     tags:
  *       - USER
  *     description: Resend otp using Email
  *     produces:
  *       - application/json
  *     parameters:
  *       - name: email
  *         description: email
  *         in: formData
  *         required: true
  *     responses:
  *       200:
  *         description: Returns success message
  */
  async resendOtp(req, res, next) {
    const validSchema = {
      email: Joi.string().required()
    }
    try {
      console.log(req.body);
      const value = await Joi.validate(req.body, validSchema);
      const userResult = await findUser({ email: value.email });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND)
      }
      const otp = commonFunction.getOtp();  //otp
      const otp_time = new Date(new Date().setMinutes(new Date().getMinutes() + 2)).toISOString();  // valid for two minutes
      const result = await updateUser({ email: userResult.email }, { otp: otp, otp_time: otp_time, isEmail_Verified: false });
      await sendMail(userResult.email, otp);
      return res.json(new response({}, responseMessage.OTP_SEND))
    } catch (error) {
      next(error);
    }
  }

  /**
 * @swagger
 * /user/loginUser:
 *   post:
 *     tags:
 *       - USER
 *     description: loginUser using email or mobile_number
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: userName
 *         description: userName ?? email || mobile_number
 *         in: formData
 *         required: true
 *       - name: password
 *         description: password
 *         in: formData
 *         required: true
 *     responses:
 *       200:
 *         description: Returns success message
 */
  async userLogin(req, res, next) {
    const validSchema = {
      userName: Joi.string().required(),
      password: Joi.string().required()
    }
    try {
      const value = await Joi.validate(req.body, validSchema);
      console.log(">>>>>>>>",value)
      const userResult = await findUser({ $or: [{ email: value.userName }, { mobile_number: value.userName }], userType: userType.user, userStatus: userStatus.active });
       console.log(">>>>>>>>>",userResult);
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND)
      }
      const isPasswordMatch = await commonFunction.compareHash(value.password, userResult.password); // Campare both hashed password and normal password
      if (!isPasswordMatch) {
        throw apiError.notAllowed(responseMessage.INCORRECT_PASSWORD)
      }
      // console.log(userResult)
      if (!userResult.isEmail_Verified) {
        throw apiError.notAllowed(responseMessage.EMAIL_NOT_VERIFIED)
      }
      const token = commonFunction.getToken({ userId: userResult._id, email: userResult.email, userType: userType.user }); // get jwt token
      const result = {
        name: userResult.name,
        email: userResult.email,
        mobile_number: userResult.mobile_number,
        token: token
      }
      return res.json(new response(result, responseMessage.USER_LOGGED))
    } catch (error) {
      next(error);
    }
  }
  /**
   * @swagger
   * /user/getProfile:
   *   get:
   *     tags:
   *       - USER
   *     description: getProfile
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: name
   *         in: header
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async getProfile(req, res, next) {
    try {
      const userResult = await findUser({ _id: req.userId });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND)
      }
      const result = {
        name: userResult.name,
        email: userResult.email,
        mobile_number: userResult.mobile_number
      }
      return res.json(new response(result, responseMessage.USER_PROFILE))
    } catch (error) {
      next(error);
    }
  }
  /**
   * @swagger
   * /user/forgetPassword:
   *   post:
   *     tags:
   *       - USER
   *     description: forgetPassword
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: email
   *         description: email
   *         in: formData
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async forgetPassword(req, res, next) {
    const validSchema = {
      email: Joi.string().required()
    };
    try {
      const value = await Joi.validate(req.body, validSchema);
      const userResult = await findUser({ email: value.email });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND)
      }
      const otp = commonFunction.getOtp(); // otp genrate
      const otp_time = new Date(new Date().setMinutes(new Date().getMinutes() + 2)).toISOString(); // otp time 2 minutes
      const result = await updateUser({ email: userResult.email }, { otp: otp, otp_time: otp_time, isEmail_Verified: false });
      await sendMail(userResult.email, otp); // send otp on mail
      return res.json(new response({}, responseMessage.OTP_SEND))
    } catch (error) {
      next(error);
    }
  }
  /**
    * @swagger
    * /user/resetPassword:
    *   put:
    *     tags:
    *       - USER
    *     description: resetPassword
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: email
    *         description: email
    *         in: formData
    *         required: true
    *       - name: password
    *         description: password
    *         in: formData
    *         required: true
    *       - name: confirm_password
    *         description: confirm_password
    *         in: formData
    *         required: true
    *     responses:
    *       200:
    *         description: Returns success message
    */
  async resetPassword(req, res, next) {
    const validSchema = {
      email: Joi.string().required(),
      password: Joi.string().required(),
      confirm_password: Joi.string().required()
    }
    try {
      const value = await Joi.validate(req.body, validSchema);
      const userResult = await findUser({ email: value.email });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND)
      }
      if (!userResult.isEmail_Verified) {
        throw apiError.notAllowed(responseMessage.EMAIL_NOT_VERIFIED)
      }
      if (value.password != value.confirm_password) {
        throw apiError.notAllowed(responseMessage.PASSWORD_NOT_MATCH)
      }
      const hashedPassword = commonFunction.createHash(value.password);  // password hashing 
      const result = await updateUser({ email: userResult.email }, { password: hashedPassword });
      return res.json(new response({}, responseMessage.PASSWORD_CHANGED))
    } catch (error) {
      next(error);
    }
  }
  /**
    * @swagger
    * /user/editProfile:
    *   put:
    *     tags:
    *       - USER
    *     description: editProfile
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: token
    *         description: token
    *         in: header
    *         required: true
    *       - name: email
    *         description: email
    *         in: formData
    *         required: true
    *       - name: mobile_number
    *         description: mobile_number
    *         in: formData
    *         required: true
    *       - name: name
    *         description: name
    *         in: formData
    *         required: true
    *     responses:
    *       200:
    *         description: Returns success message
    */
  async editProfile(req, res, next) {
    const validSchema = {
      email: Joi.string().required(),
      mobile_number: Joi.string().required(),
      name: Joi.string().required(),
    }
    try {
      const value = await Joi.validate(req.body, validSchema);
      // console.log(">>>>>>>>>", value)
      const userResult = await findUser({ _id: req.userId });
      // console.log(">>>>>>>>>>>", userResult)
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND)
      }
      let result;
      if (value.email && !value.mobile_number) {
        result = await findUser({ $and: [{ email: value.email }, { _id: { $ne: userResult._id } }] });
        if (result) {
          throw apiError.alreadyExist(responseMessage.EMAIL_EXIST)
        }
      }
      else if (!value.email && value.mobile_number) {
        result = await findUser({ $and: [{ mobile_number: value.mobile_number }, { _id: { $ne: userResult._id } }] });
        if (result) {
          throw apiError.alreadyExist(responseMessage.MOBILE_EXIST)
        }
      }
      else if (value.email && value.mobile_number) {
        result = await findUser({ $and: [{ $or: [{ email: value.email }, { mobile_number: value.mobile_number }] }, { _id: { $ne: userResult._id } }] });
        // console.log(">>>>>>>>>>>", result)
        if (result) {
          if (value.email === result.email) {
            throw apiError.alreadyExist(responseMessage.EMAIL_EXIST);
          }
          else {
            throw apiError.alreadyExist(responseMessage.MOBILE_EXIST)
          }
        }
      }
      const otp = commonFunction.getOtp(); // otp genrate
      const otp_time = new Date(new Date().setMinutes(new Date().getMinutes() + 2)).toISOString(); // otp valid for 2 minutes
      const obj = {
        email: value.email,
        mobile_number: value.mobile_number,
        name: value.name,
        otp: otp,
        otp_time: otp_time,
        isEmail_Verified: false
      }
      sendMail(value.email, otp) // send otp mail
      await updateUser({ _id: userResult._id }, obj);
      return res.json(new response({}, responseMessage.PROFILE_UPDATE))
    } catch (error) {
      next(error)
    }
  }
  /**
   * @swagger
   * /user/deleteUser:
   *   delete:
   *     tags:
   *       - USER
   *     description: Delete a user
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *     responses:
   *       200:
   *         description: User deleted successfully
   */

  async deleteUser(req, res, next) {
    try {
      const userResult = await findUser({ _id: req.userId });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      await updateUser({ _id: userResult._id }, { userStatus: userStatus.delete });
      return res.json(new response({}, responseMessage.DELETE_SUCCESS));
    } catch (error) {
      next(error)
    }
  }

  /**
   * @swagger
   * /user/userList:
   *   get:
   *     tags:
   *       - USER
   *     description: Get list of users
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: page
   *         description: Page number
   *         in: formData
   *         required: false
   *       - name: limit
   *         description: Number of users per page
   *         in: formData
   *         required: false
   *     responses:
   *       200:
   *         description: List of users retrieved successfully
   */
  async usersList(req, res, next) {
    const validSchema = {
      page: Joi.string().optional(),
      limit: Joi.string().optional()
    };
    try {
      const value = await Joi.validate(req.body, validSchema);
      const userResult = await findUser({ _id: req.userId });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      const result = await findUserList(value);
      if (!result) {
        throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
      }
      return res.json(new response(result, responseMessage.DATA_FOUND));
    } catch (error) {
      next(error);
    }
  }
  /**
  * @swagger
  * /user/followUser:
  *   put:
  *     tags:
  *       - USER
  *     description: Follow another user
  *     produces:
  *       - application/json
  *     parameters:
  *       - name: token
  *         description: Authentication token
  *         in: header
  *         required: true
  *       - name: userID
  *         description: ID of the user to follow
  *         in: formData
  *         required: true
  *     responses:
  *       200:
  *         description: User followed successfully
  */
  async followUser(req, res, next) {
    const validSchema = {
      userID: Joi.string().required()
    }
    try {
      const value = await Joi.validate(req.body, validSchema);
      const userResult = await findUser({ _id: req.userId });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND)
      }
      const user = await findUser({ _id: value.userID, userStatus: userStatus.active });
      if (!user) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND)
      }
      if (user.followers.includes(userResult._id)) {
        throw apiError.alreadyExist(responseMessage.ALREADY_FOLLOW);
      }
      await updateUser({ _id: user._id }, { $push: { followers: userResult._id } });
      await updateUser({ _id: userResult._id }, { $push: { followings: userResult._id } });
      return res.json(new response({}, responseMessage.FOLLOW_SUCCESS))
    } catch (error) {
      next(error)
    }
  }
}

export default new userController();
