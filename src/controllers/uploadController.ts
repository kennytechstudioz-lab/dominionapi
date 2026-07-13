import { Request, Response } from "express";
import { uploadToS3, deleteFromS3 } from "../utils/s3Upload";

/**
 * Controller: Handles a single image file upload and stores it on the local disk.
 *
 * @param req Express Request object containing the multer-parsed file
 * @param res Express Response object
 */
export async function uploadMedia(req: Request, res: Response) {
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
    const publicUrl = await uploadToS3(buffer, originalname, mimetype, hostUrl);

    // 3. Return secure URL resource path
    return res.status(200).json({
      success: true,
      url: publicUrl,
      fileName: originalname,
    });
  } catch (err: any) {
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
export async function deleteMedia(req: Request, res: Response) {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({
        success: false,
        error: "No image public URL provided in request payload.",
      });
    }

    // Trigger local file deletion
    await deleteFromS3(url);

    return res.status(200).json({
      success: true,
      message: "Media object deleted successfully from local storage.",
    });
  } catch (err: any) {
    console.error("Local Storage Deletion Error: ", err);
    return res.status(500).json({
      success: false,
      error: err.message || "An unexpected error occurred while deleting from local storage.",
    });
  }
}
