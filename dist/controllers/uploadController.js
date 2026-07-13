"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMedia = uploadMedia;
exports.deleteMedia = deleteMedia;
const s3Upload_1 = require("../utils/s3Upload");
/**
 * Controller: Handles a single image file upload and stores it on the local disk.
 *
 * @param req Express Request object containing the multer-parsed file
 * @param res Express Response object
 */
async function uploadMedia(req, res) {
    try {
        // 1. Ensure a file exists in the multipart request body
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: "No image file provided in the upload request payload.",
            });
        }
        const { buffer, originalname, mimetype } = req.file;
        // Build the base server URL host dynamically from the incoming request (supports localhost & production proxy IP/Domain)
        const hostUrl = `${req.protocol}://${req.get("host")}`;
        // 2. Dispatch file stream buffer to local storage
        const publicUrl = await (0, s3Upload_1.uploadToS3)(buffer, originalname, mimetype, hostUrl);
        // 3. Return secure URL resource path
        return res.status(200).json({
            success: true,
            url: publicUrl,
            fileName: originalname,
        });
    }
    catch (err) {
        console.error("Local Storage Upload Error: ", err);
        return res.status(500).json({
            success: false,
            error: err.message || "An unexpected error occurred while saving the upload to local storage.",
        });
    }
}
/**
 * Controller: Removes an image from the local storage given its public URL.
 *
 * @param req Express Request containing target URL in body
 * @param res Express Response
 */
async function deleteMedia(req, res) {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({
                success: false,
                error: "No image public URL provided in request payload.",
            });
        }
        // Trigger local file deletion
        await (0, s3Upload_1.deleteFromS3)(url);
        return res.status(200).json({
            success: true,
            message: "Media object deleted successfully from local storage.",
        });
    }
    catch (err) {
        console.error("Local Storage Deletion Error: ", err);
        return res.status(500).json({
            success: false,
            error: err.message || "An unexpected error occurred while deleting from local storage.",
        });
    }
}
