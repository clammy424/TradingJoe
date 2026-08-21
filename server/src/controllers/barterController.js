const Post = require('../models/Post');
const Barter = require('../models/Barter');

const createBarter = async (req, res) => {
  try {
    const { postId } = req.params;
    const { message } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    if (post.status !== "open") {
      return res.status(400).json({
        message: "Post is not open"
      });
    }

    if (post.creatorId.toString() === req.user.id) {
      return res.status(403).json({
        message: "Post creator cannot propose a barter on their own post"
      });
    }

    if (!message) {
      return res.status(400).json({
        message: "Missing required fields"
      });
    }

    const barter = await Barter.create({
      postId,
      creatorId: req.user.id,
      message,
      status: "pending"
    });

    return res.status(201).json({
      message: "Barter created successfully",
      barter
    });

  } catch (error) {
    console.error("CREATE BARTER ERROR:", error);

    res.status(500).json({
      message: "Failed to create barter"
    });
  }
};

const rejectBarter = async (req, res) => {
  try {
    const { barterId } = req.params;

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: "Unauthorized"
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

    if (post.creatorId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Forbidden"
      });
    }

    if (barter.status === "rejected") {
      return res.status(400).json({
        message: "Barter is already rejected"
      });
    }

    const wasAccepted = barter.status === "accepted";

    barter.status = "rejected";
    await barter.save();

    if (wasAccepted) {
      const acceptedCount = await Barter.countDocuments({
        postId: post._id,
        status: "accepted"
      });

      if (post.status === "closed" && acceptedCount < (post.maxMatches ?? 1)) {
        post.status = "open";
        await post.save();
      }
    }

    return res.status(200).json({
      message: "Barter rejected successfully",
      barter
    });

  } catch (error) {
    console.error("REJECT BARTER ERROR:", error);

    res.status(500).json({
      message: "Failed to reject barter"
    });
  }
};

const acceptBarter = async (req, res) => {
  try {
    const { barterId } = req.params;

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: "Unauthorized"
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

    if (post.creatorId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Forbidden"
      });
    }

    if (barter.status !== "pending") {
      return res.status(400).json({
        message: "Barter is not pending"
      });
    }

    if (post.status === "cancelled") {
      return res.status(400).json({
        message: "Cancelled posts cannot accept barters"
      });
    }

    const acceptedCount = await Barter.countDocuments({
      postId: post._id,
      status: "accepted"
    });

    if (acceptedCount >= (post.maxMatches ?? 1)) {
      return res.status(400).json({
        message: "Post has already reached its maximum matches"
      });
    }

    barter.status = "accepted";
    await barter.save();

    // if (response) {
    //   response.status = "accepted";
    //   await response.save();
    // }

    const newAcceptedCount = await Barter.countDocuments({
      postId: post._id,
      status: "accepted"
    });

    if (newAcceptedCount >= (post.maxMatches ?? 1)) {
      post.status = "closed";
      await post.save();
    }

    return res.status(200).json({
      message: "Barter accepted successfully",
      barter
    });

  } catch (error) {
    console.error("ACCEPT BARTER ERROR:", error);

    res.status(500).json({
      message: "Failed to accept barter"
    });
  }
};

module.exports = {
  createBarter,
  rejectBarter,
  acceptBarter
};
