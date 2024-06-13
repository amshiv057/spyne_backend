import Express from "express";
import controller from "./controller";
import auth from "../../../../helper/auth";
import upload from "../../../../helper/uploadHandler";
export default Express.Router()
    .use(auth.verifyToken)
    .use(upload.uploadFile)
    .post('/createPost', controller.createPost)
    .get("/viewPost", controller.viewPost)
    .get("/postList", controller.postList)
    .put("/updatePost", controller.updatePost)
    .delete("/deletePost", controller.deletePost)
    .post("/createComment", controller.createComment)
    .post("/likeComment", controller.likeComment)
    .put("/updateComment", controller.updateComment)
    .post("/replyComment", controller.replyComment)
    .delete("/deleteComment", controller.deleteComment)
    .put("/likePost", controller.likePost)
    .get("/viewsOnPost", controller.viewsOnPost)


