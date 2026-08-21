const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { rejectBarter, acceptBarter } = require("../controllers/barterController");
const { getMessages, sendMessage } = require("../controllers/messageController");

const router = express.Router();

router.patch("/:barterId/reject", authMiddleware, rejectBarter);

router.patch("/:barterId/accept", authMiddleware, acceptBarter);

router.get("/:barterId/messages", authMiddleware, getMessages);

router.post("/:barterId/messages", authMiddleware, sendMessage);

module.exports = router;
