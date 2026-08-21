const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { createPost, getPosts, getPostById, updatePost } = require("../controllers/postController");
const { createBarter } = require("../controllers/barterController");

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

router.get("/:postId", authMiddleware, getPostById);

router.put("/:postId", authMiddleware, updatePost);

router.post("/:postId/barters", authMiddleware, createBarter);

module.exports = router;
