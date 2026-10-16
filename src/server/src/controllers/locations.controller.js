import { ObjectId } from "mongodb";
import fs from "fs";
import path from "path";
import { getDb } from "../db.js";
import { UPLOADS_DIR } from "../middleware/upload.js";

const REQUIRED_FIELDS = ["name", "street", "zip", "city", "category", "lat", "lng"];

function isValidId(id) {
  return ObjectId.isValid(id);
}

// Deletes a location's image file from disk, if it has one.
// imageUrl is stored as "/uploads/<filename>".
// Awaited by callers so the response only goes out once the file is actually gone.
async function deleteImageFile(imageUrl) {
  if (!imageUrl) return;
  const filename = path.basename(imageUrl);
  const filePath = path.join(UPLOADS_DIR, filename);
  try {
    await fs.promises.unlink(filePath);
  } catch (err) {
    // ENOENT just means the file was already gone - safe to ignore.
    if (err.code !== "ENOENT") {
      console.error("Failed to delete image file:", err);
    }
  }
}

// GET /loc
export async function getAllLocations(req, res) {
  const db = getDb();
  const locations = await db.collection("locations").find().toArray();
  res.status(200).json(locations);
}

// GET /loc/:id
export async function getLocationById(req, res) {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ error: "Invalid id" });

  const db = getDb();
  const location = await db.collection("locations").findOne({ _id: new ObjectId(id) });

  if (!location) return res.status(404).json({ error: "Location not found" });
  res.status(200).json(location);
}

// POST /loc
export async function createLocation(req, res) {
  const body = req.body;

  const missing = REQUIRED_FIELDS.filter((field) => body[field] === undefined || body[field] === "");
  if (missing.length > 0) {
    return res.status(400).json({ error: `Missing required fields: ${missing.join(", ")}` });
  }

  const newLocation = {
    name: body.name,
    description: body.description ?? "",
    street: body.street,
    zip: body.zip,
    city: body.city,
    category: body.category,
    lat: Number(body.lat),
    lng: Number(body.lng),
    imageUrl: null,
  };

  const db = getDb();
  const result = await db.collection("locations").insertOne(newLocation);

  res
    .status(201)
    .location(`/loc/${result.insertedId}`)
    .json({ _id: result.insertedId, ...newLocation });
}

// PUT /loc/:id
export async function updateLocation(req, res) {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ error: "Invalid id" });

  const db = getDb();
  const collection = db.collection("locations");

  const existing = await collection.findOne({ _id: new ObjectId(id) });
  if (!existing) return res.status(404).json({ error: "Location not found" });

  const body = req.body;
  const updatableFields = ["name", "description", "street", "zip", "city", "category", "lat", "lng"];
  const update = {};

  for (const field of updatableFields) {
    if (body[field] !== undefined) {
      update[field] = field === "lat" || field === "lng" ? Number(body[field]) : body[field];
    }
  }

  await collection.updateOne({ _id: new ObjectId(id) }, { $set: update });
  res.status(204).send();
}

// DELETE /loc/:id
export async function deleteLocation(req, res) {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ error: "Invalid id" });

  const db = getDb();
  const collection = db.collection("locations");

  const existing = await collection.findOne({ _id: new ObjectId(id) });
  if (!existing) return res.status(404).json({ error: "Location not found" });

  await deleteImageFile(existing.imageUrl);
  await collection.deleteOne({ _id: new ObjectId(id) });

  res.status(204).send();
}

// POST /loc/:id/image  (multer has already saved req.file to disk by this point)
export async function uploadLocationImage(req, res) {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ error: "Invalid id" });
  if (!req.file) return res.status(400).json({ error: "No image file provided" });

  const db = getDb();
  const collection = db.collection("locations");

  const existing = await collection.findOne({ _id: new ObjectId(id) });
  if (!existing) {
    // Multer already wrote the file to disk before this handler ran -
    // clean it up so we don't leave an orphaned file with no matching location.
    await fs.promises.unlink(req.file.path).catch(() => {});
    return res.status(404).json({ error: "Location not found" });
  }

  const hadImageBefore = Boolean(existing.imageUrl);
  if (hadImageBefore) {
    await deleteImageFile(existing.imageUrl);
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  await collection.updateOne({ _id: new ObjectId(id) }, { $set: { imageUrl } });

  res.status(hadImageBefore ? 200 : 201).json({ imageUrl });
}

// DELETE /loc/:id/image
export async function deleteLocationImage(req, res) {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ error: "Invalid id" });

  const db = getDb();
  const collection = db.collection("locations");

  const existing = await collection.findOne({ _id: new ObjectId(id) });
  if (!existing) return res.status(404).json({ error: "Location not found" });

  await deleteImageFile(existing.imageUrl);
  await collection.updateOne({ _id: new ObjectId(id) }, { $set: { imageUrl: null } });

  res.status(204).send();
}