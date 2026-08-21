const Post = require('../models/Post');
const Barter = require('../models/Barter');
const Message = require('../models/Message');

const sendMessage = async (req, res) => {
  try {
    const { barterId } = req.params;
    const { text } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({
        message: "Missing required fields"
      });
    }

    const barter = await Barter.findById(barterId);

    if (!barter) {
      return res.status(404).json({
        message: "Barter not found"
      });
    }

    const post = await Post.findById(barter.postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    const barterCreatorId = barter.creatorId.toString();
    const postCreatorId = post.creatorId.toString();

    if (req.user.id !== barterCreatorId && req.user.id !== postCreatorId) {
      return res.status(403).json({
        message: "Forbidden"
      });
    }

    const recipientId = req.user.id === barterCreatorId ? postCreatorId : barterCreatorId;

    const newMessage = await Message.create({
      barterId,
      senderId: req.user.id,
      recipientId,
      text
    });

    return res.status(201).json({
      message: "Message sent successfully",
      newMessage
    });

  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error);

    res.status(500).json({
      message: "Failed to send message"
    });
  }
};

module.exports = {
  sendMessage
};
