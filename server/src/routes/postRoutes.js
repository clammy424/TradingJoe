const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { createPost } = require("../controllers/postController");

const router = express.Router();

router.post("/create-post", authMiddleware, createPost);

module.exports = router;
