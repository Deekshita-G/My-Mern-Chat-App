const express = require("express");
const {
  allMessages,
  sendMessage,
  markMessagesAsSeen,
} = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/:chatId").get(protect, allMessages);       // Get messages & mark delivered
router.route("/").post(protect, sendMessage);              // Send new message
router.route("/:chatId/seen").put(protect, markMessagesAsSeen);
 // Mark messages as seen

module.exports = router;
