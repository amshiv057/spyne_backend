import userContent from "./api/v1/controllers/user/routes"
import postContent from "./api/v1/controllers/post/routes"

export default function routes(app) {
    app.use('/api/v1/user', userContent)
    app.use("/api/v1/post", postContent)
    return app;
}