const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
import cors from "cors";
import * as path from "path";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import apiErrorhandler from '../helper/apiErrorHandler';
const app = express();
const root = path.normalize(`${__dirname}/../..`);
class ExpressServer {
    constructor() {
        app.use(express.json({ limit: '1000mb' }));
        app.use(express.urlencoded({ extended: true, limit: '1000mb' }));
        app.use(morgan('dev'))
        app.use(
            cors({
                allowedHeaders: ["Content-Type", "token", "authorization"],
                exposedHeaders: ["token", "authorization"],
                origin: "*",
                methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
                preflightContinue: false,
            })
        );
    }
    router(routes) {
        routes(app);
        return this
    }
    configureSwagger(swaggerDefinition) {
        const options = {
            swaggerDefinition,
            explorer: true,
            apis: [
                path.resolve(`${root}/server/api/v1/controllers/**/*.js`),
                path.resolve(`${root}/api.yaml`),
            ],
        };

        app.use(
            "/api-docs",
            swaggerUi.serve,
            swaggerUi.setup(swaggerJSDoc(options))
        );
        return this;
    }
    handleError() {
        app.use(apiErrorhandler);
        return this;
    }
    async configureDb(dbUrl) {
        try {
            // console.log(dbUrl)
            mongoose.connect(dbUrl, {
            })
            console.log('Connected to MongoDB ✔');
            return this;

        } catch (error) {
            console.error('Error connecting to MongoDB:', error);
            throw error;
        }
    }
    listen(port) {
        app.listen(port, () => {
            console.log(`Server is running on port ${port} ${new Date().toLocaleString()}`);
        })
        return app;
    }
}

export default ExpressServer;