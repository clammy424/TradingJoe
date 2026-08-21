const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { getUserById } = require("../controllers/userController");
const { getPostsByUser } = require("../controllers/postController");

const router = express.Router();

router.get("/:userId", authMiddleware, getUserById);

router.get("/:userId/posts", authMiddleware, getPostsByUser);

module.exports = router;
