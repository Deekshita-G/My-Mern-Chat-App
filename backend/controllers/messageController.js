const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

// @description     Get all Messages
// @route           GET /api/message/:chatId
// @access          Protected
const allMessages = asyncHandler(async (req, res) => {
  try {
    const chatId = req.params.chatId;

    // Mark messages from others as delivered
    await Message.updateMany(
      {
        chat: chatId,
        sender: { $ne: req.user._id },
        status: "sent",
      },
      { $set: { status: "delivered" } }
    );

    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name pic email")
      .populate("chat");

    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @description     Create New Message
// @route           POST /api/message/
// @access          Protected
const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
    status: "sent", // New status field
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic").execPopulate();
    message = await message.populate("chat").execPopulate();
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @description     Mark messages as seen
// @route           PUT /api/message/:chatId/seen
// @access          Protected
const markMessagesAsSeen = asyncHandler(async (req, res) => {
  try {
    await Message.updateMany(
      {
        chat: req.params.chatId,
        sender: { $ne: req.user._id },
        status: { $ne: "seen" },
      },
      { $set: { status: "seen" } }
    );

    res.status(200).json({ message: "Messages marked as seen" });
  } catch (error) {
    res.status(500);
    throw new Error("Failed to mark messages as seen");
  }
});

module.exports = { allMessages, sendMessage, markMessagesAsSeen };
