import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { validateRequest } from "../middleware/validate";
import { authenticateToken } from "../middleware/auth";
import {
  signupSchema,
  loginSchema,
  resetPasswordSchema,
  forgotPasswordSchema,
} from "../validators/user.validator";

/**
 * Initializes a new Router instance.
 * This router will be used to define user-related routes.
 */
const router = Router();

router.post("/signup", validateRequest(signupSchema), UserController.signup);
router.post("/login", validateRequest(loginSchema), UserController.login);
router.get("/verify-email/:token", UserController.verifyEmail);
router.post(
  "/forgot-password",
  validateRequest(forgotPasswordSchema),
  UserController.forgotPassword
);
router.post(
  "/reset-password/:token",
  validateRequest(resetPasswordSchema),
  UserController.resetPassword
);

router.get("/users", authenticateToken, UserController.getUsers);
router.get("/users/stats", authenticateToken, UserController.getUserStats);

export default router;
