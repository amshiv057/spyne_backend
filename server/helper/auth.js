const jwt = require("jsonwebtoken");
const userModel = require("../models/user");
require("../../config/config");

module.exports = {
    async verifyToken(req, res, next) {
        if (req.headers.token) {
            jwt.verify(req.headers.token, global.gConfig.jwtsecret, async (err, result) => {
                if (err) {
                    throw res.status(401).send({ responseCode: 401, responseMessage: 'Unauthorized' })
                }
                else {
                    const userReslt = await userModel.findOne({ _id: result.userId });
                    // console.log(userReslt)
                    if (!userReslt) {
                        throw res.status(404).send({ responseCode: 404, responseMessage: 'user Not found' })
                    }
                    else {
                        req.userId = result.userId;
                        req.email = result.email;
                        req.userDetails = result;
                        next();
                    }
                }
            })
        }
        else {
            throw res.send({ responseCode: 400, responseMessage: 'token required please provide token' })
        }
    }

}