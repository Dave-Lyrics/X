import express from "express";
import { getMe, login, logout, signup, verifyEmail, forgotPassword, resetPassword, googleAuth } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/me", protectRoute, getMe);
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/google", googleAuth);

router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

export default router;
