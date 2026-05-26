import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
	followUnfollowUser,
	getSuggestedUsers,
	getUserProfile,
	updateUser,
	getFollowersFollowing,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/profile/:username", protectRoute, getUserProfile);
router.get("/suggested", protectRoute, getSuggestedUsers);
router.post("/follow/:id", protectRoute, followUnfollowUser);
router.post("/update", protectRoute, updateUser);
router.get("/follow-data/:id", protectRoute, getFollowersFollowing);

export default router;
