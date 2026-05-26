import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
	commentOnPost,
	createPost,
	deletePost,
	getAllPosts,
	getFollowingPosts,
	getLikedPosts,
	getUserPosts,
	likeUnlikePost,
	likeUnlikeComment,
	saveUnsavePost,
	getSavedPosts,
	repostPost,
	getRepostedPosts,
} from "../controllers/post.controller.js";

const router = express.Router();

router.get("/all", protectRoute, getAllPosts);
router.get("/following", protectRoute, getFollowingPosts);
router.get("/likes/:id", protectRoute, getLikedPosts);
router.get("/user/:username", protectRoute, getUserPosts);
router.post("/create", protectRoute, createPost);
router.post("/like/:id", protectRoute, likeUnlikePost);
router.post("/comment/:id", protectRoute, commentOnPost);
router.delete("/:id", protectRoute, deletePost);
router.post("/comment/like/:postId/:commentId", protectRoute, likeUnlikeComment);
router.post("/save/:id", protectRoute, saveUnsavePost);
router.get("/saved/all", protectRoute, getSavedPosts);
router.post("/repost/:id", protectRoute, repostPost);
router.get("/reposts/:id", protectRoute, getRepostedPosts);

export default router;
