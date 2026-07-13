import { Request, Response } from "express";
import { Staff } from "../models/Staff";
import { deleteLocalFile } from "../utils/s3Upload";

export async function getAllStaff(req: Request, res: Response) {
  const staff = await Staff.find().sort({ createdAt: -1 });
  return res.json({ success: true, staff });
}

export async function createStaff(req: Request, res: Response) {
  const { name, position, description, picture } = req.body;
  if (!name || !position || !description) {
    return res.status(400).json({ error: "Name, position, and description are required." });
  }
  const staff = await Staff.create({ name, position, description, picture: picture || "" });
  return res.status(201).json({ success: true, staff });
}

export async function updateStaff(req: Request, res: Response) {
  const { id } = req.params;
  const { name, position, description, picture } = req.body;
  const staff = await Staff.findById(id);
  if (!staff) return res.status(404).json({ error: "Staff member not found." });
  if (name !== undefined) staff.name = String(name).trim();
  if (position !== undefined) staff.position = String(position).trim();
  if (description !== undefined) staff.description = String(description).trim();
  if (picture !== undefined) {
    // Delete old picture from disk if picture is being replaced
    if (picture !== staff.picture && staff.picture) deleteLocalFile(staff.picture);
    staff.picture = String(picture);
  }
  await staff.save();
  return res.json({ success: true, staff });
}

export async function deleteStaff(req: Request, res: Response) {
  const { id } = req.params;
  const staff = await Staff.findByIdAndDelete(id);
  if (!staff) return res.status(404).json({ error: "Staff member not found." });
  // Delete associated picture from disk
  if (staff.picture) deleteLocalFile(staff.picture);
  return res.json({ success: true, message: "Staff member deleted." });
}
