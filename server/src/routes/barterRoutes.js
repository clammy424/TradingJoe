const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { rejectBarter, acceptBarter } = require("../controllers/barterController");

const router = express.Router();

router.patch("/:barterId/reject", authMiddleware, rejectBarter);

router.patch("/:barterId/accept", authMiddleware, acceptBarter);

module.exports = router;
