import fs from "fs";
import path from "path";

/**
 * Uploads a raw file buffer directly to the local uploads directory.
 *
 * @param fileBuffer The binary file buffer from multer memory storage
 * @param fileName Original file name
 * @param mimeType Targeted file mimetype
 * @param hostUrl The base protocol and host of the server (e.g. http://localhost:5002)
 * @returns The fully qualified public URL path to access the file
 */
export async function uploadToS3(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  hostUrl: string
): Promise<string> {
  const uploadDir = path.join(__dirname, "../../uploads");
  
  // Ensure local uploads directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Format clean file name to avoid spacing collisions
  const cleanFileName = fileName.replace(/\s+/g, "_");
  const uniqueName = `${Date.now()}-${cleanFileName}`;
  const filePath = path.join(uploadDir, uniqueName);

  // Write file buffer to local disk synchronously
  fs.writeFileSync(filePath, fileBuffer);

  // Prefer the explicit BASE_URL env variable (for VPS/proxy setups),
  // fall back to the dynamic host derived from the incoming request (local dev)
  const baseUrl = process.env.BASE_URL?.replace(/\/$/, "") || hostUrl;

  // Return the fully qualified HTTP path
  return `${baseUrl}/uploads/${uniqueName}`;
}

/**
 * Deletes a file from the local uploads directory given its public URL.
 *
 * @param fileUrl The fully qualified public HTTP URL of the asset
 */
export async function deleteFromS3(fileUrl: string): Promise<void> {
  try {
    const urlParts = fileUrl.split("/uploads/");
    if (urlParts.length < 2) return;
    
    const fileName = decodeURIComponent(urlParts[1]);
    const filePath = path.join(__dirname, "../../uploads", fileName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error("Local file deletion error: ", err);
    throw err;
  }
}

/**
 * Silently deletes a local upload file given its URL.
 * Only acts on local /uploads/ URLs — ignores external S3 or CDN links.
 * Does not throw — safe to call without try/catch.
 *
 * @param fileUrl The fully qualified URL of the asset to remove
 */
export function deleteLocalFile(fileUrl: string | undefined | null): void {
  if (!fileUrl) return;
  // Only process local upload URLs (skip old S3 or external CDN links)
  if (!fileUrl.includes("/uploads/")) return;
  try {
    const urlParts = fileUrl.split("/uploads/");
    if (urlParts.length < 2) return;
    const fileName = decodeURIComponent(urlParts[1]);
    const filePath = path.join(__dirname, "../../uploads", fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`[Cleanup] Deleted orphaned upload: ${fileName}`);
    }
  } catch (err) {
    console.error("[Cleanup] Failed to delete local file:", err);
  }
}
