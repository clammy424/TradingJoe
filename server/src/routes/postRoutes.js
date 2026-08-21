const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { createPost, getPosts, getEngagedPosts, getPostById, updatePost, cancelPost, uncancelPost } = require("../controllers/postController");
const { createBarter, getMyBartersForPost } = require("../controllers/barterController");

const router = express.Router();

router.post("/create-post", authMiddleware, createPost);

router.get(
  "/",
  authMiddleware,
  (req, res, next) => {
    console.log("GET POSTS ROUTE HIT");
    next();
  },
  getPosts
);

router.get("/engaged", authMiddleware, getEngagedPosts);

router.get("/:postId", authMiddleware, getPostById);

router.put("/:postId", authMiddleware, updatePost);

router.put("/:postId/cancel", authMiddleware, cancelPost);

router.put("/:postId/uncancel", authMiddleware, uncancelPost);

router.post("/:postId/barters", authMiddleware, createBarter);

router.get("/:postId/barters/mine", authMiddleware, getMyBartersForPost);

module.exports = router;
