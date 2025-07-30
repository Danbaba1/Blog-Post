import { Router } from "express";
import { ProfileController } from "../controllers/profile.controller";
import { validateRequest } from "../middleware/validate";
import { authenticateToken } from "../middleware/auth";
import { updateProfileSchema } from "../validators/profile.validator";
import {
  uploadProfilePicture,
  handleUploadError,
} from "../middleware/upload.middleware";

const router = Router();

router.get("/profile/me", authenticateToken, ProfileController.getMyProfile);
router.put(
  "/profile/me",
  authenticateToken,
  validateRequest(updateProfileSchema),
  ProfileController.updateMyProfile
);

router.post(
  "/profile/upload-picture",
  authenticateToken,
  uploadProfilePicture.single("profilePicture"),
  handleUploadError,
  ProfileController.uploadProfilePicture
);

router.delete(
  "/profile/delete-picture",
  authenticateToken,
  ProfileController.deleteProfilePicture
);

router.get("/profile/:userId", ProfileController.getPublicProfile);

if (process.env.NODE_ENV !== "production") {
  router.use("/uploads", require("express").static("uploads"));
}

export default router;
