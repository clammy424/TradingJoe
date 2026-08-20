const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { createPost, getPosts, getPostById } = require("../controllers/postController");

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

module.exports = router;
