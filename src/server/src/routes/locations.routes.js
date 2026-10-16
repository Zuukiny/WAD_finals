import { Router } from "express";
import { upload } from "../middleware/upload.js";
import {
  getAllLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
  uploadLocationImage,
  deleteLocationImage,
} from "../controllers/locations.controller.js";

const router = Router();

router.get("/loc", getAllLocations);
router.get("/loc/:id", getLocationById);
router.post("/loc", createLocation);
router.put("/loc/:id", updateLocation);
router.delete("/loc/:id", deleteLocation);

router.post("/loc/:id/image", upload.single("image"), uploadLocationImage);
router.delete("/loc/:id/image", deleteLocationImage);

export default router;
