import multer from "multer";
import path from "path";
import apiError from "./apiError";
export class UploadHandler {
    constructor(fileSize) {
        this.fileSize = fileSize;
        this.max_image_size = 204800;
        this.max_video_size = 2048000;
        this.storage = multer.diskStorage({
            destination(req, file, cb) {
                const root = path.normalize(`${__dirname}/../..`);
                cb(null, `${root}/uploads/`);
            },
            filename(req, file, cb) {
                cb(null, `${Date.now()}_${file.originalname.replace(/\s/g, '')}`);
            }
        });
        this.uploadFile = this.uploadFile.bind(this);
        const root = path.normalize(`${__dirname}/../..`);
    }

    handleUploadError(req, res, next, upload) {
        upload(req, res, function (err) {
            if (err) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    throw apiError.badRequest("File size limit exceeds")
                }
                console.log(err);
                throw apiError.badRequest("File size limit exceeds")
            }
            return next();
        });
    }

    uploadFile(req, res, next) {
        // console.log("req.files>>>>>>", req.files);
        const upload = multer({
            storage: this.storage,
            fileFilter: function (req, file, cb) {
                var ext = path.extname(file.originalname).toLowerCase();
                // console.log("sssss", ext);
                cb(null, true)
            },
            limits: {
                fileSize: 10000000 * 90
            },
        }).any();
        this.handleUploadError(req, res, next, upload);
    }
}

export default new UploadHandler();
