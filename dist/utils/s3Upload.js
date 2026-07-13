"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToS3 = uploadToS3;
exports.deleteFromS3 = deleteFromS3;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Uploads a raw file buffer directly to the local uploads directory.
 *
 * @param fileBuffer The binary file buffer from multer memory storage
 * @param fileName Original file name
 * @param mimeType Targeted file mimetype
 * @param hostUrl The base protocol and host of the server (e.g. http://localhost:5002)
 * @returns The fully qualified public URL path to access the file
 */
async function uploadToS3(fileBuffer, fileName, mimeType, hostUrl) {
    const uploadDir = path_1.default.join(__dirname, "../../uploads");
    // Ensure local uploads directory exists
    if (!fs_1.default.existsSync(uploadDir)) {
        fs_1.default.mkdirSync(uploadDir, { recursive: true });
    }
    // Format clean file name to avoid spacing collisions
    const cleanFileName = fileName.replace(/\s+/g, "_");
    const uniqueName = `${Date.now()}-${cleanFileName}`;
    const filePath = path_1.default.join(uploadDir, uniqueName);
    // Write file buffer to local disk synchronously
    fs_1.default.writeFileSync(filePath, fileBuffer);
    // Return the fully qualified HTTP path
    return `${hostUrl}/uploads/${uniqueName}`;
}
/**
 * Deletes a file from the local uploads directory given its public URL.
 *
 * @param fileUrl The fully qualified public HTTP URL of the asset
 */
async function deleteFromS3(fileUrl) {
    try {
        const urlParts = fileUrl.split("/uploads/");
        if (urlParts.length < 2)
            return;
        const fileName = decodeURIComponent(urlParts[1]);
        const filePath = path_1.default.join(__dirname, "../../uploads", fileName);
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
    }
    catch (err) {
        console.error("Local file deletion error: ", err);
        throw err;
    }
}
