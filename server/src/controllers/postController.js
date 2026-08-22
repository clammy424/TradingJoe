const Post = require('../models/Post');
const Response = require('../models/Response');
const Barter = require('../models/Barter');

// Returns an error message if the deadline is invalid or not in the future,
// or null if it is a valid future deadline.
const validateDeadline = (deadline) => {
    const parsed = new Date(deadline);

    if (isNaN(parsed.getTime())) {
        return "Invalid deadline";
    }

    if (parsed <= new Date()) {
        return "Deadline must be in the future";
    }

    return null;
};


// TODO: Create a new post
const createPost = async (req, res) => {
    try {
        // 1. Get data from request
        console.log("HIT CREATE POST ROUTE");
        console.log("REQ.BODY:", req.body);
        console.log("REQ.USER:", req.user);

        const { title, 
            description, 
            deadline, 
            maxMatches,
            requests,
            offers
        } = req.body;

        // 2. Make sure user is authenticated
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        // 3. Verify required fields
        if (!title || !description || !requests || !offers) {
            return res.status(400).json({
                message: "Missing required fields",
            });
        }

        // 3.5 Validate deadline, if provided
        if (deadline) {
            const deadlineError = validateDeadline(deadline);

            if (deadlineError) {
                return res.status(400).json({
                    message: deadlineError,
                });
            }
        }

        // 4. Create Post & Responses
        const post = await Post.create({
            creatorId: req.user.id,
            title,
            description,
            deadline,
            maxMatches
        });

        // Create a Response document for every request
        for (const request of requests) {
        await Response.create({
            postId: post._id,
            description: request.description,
            type: "request",
            creatorId: req.user.id,
            category: request.category,
        });
        }

        // Create a Response document for every offer
        for (const offer of offers) {
        await Response.create({
            postId: post._id,
            description: offer.description,
            type: "offer",
            creatorId: req.user.id,
            category: offer.category,
        });
        }

        // 5. Return Post
        return res.status(201).json({
            message: "Post created successfully",
            post,
        });
    }
    catch (error) {
        // 6. Return Server Error
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const getPosts = async (req, res) => {
  try {
    const posts = await Post.find({
      status: "open"
    })
      .populate("creatorId", "username")
      .sort({ createdAt: -1 })
      .lean();

    const postIds = posts.map((post) => post._id);

    const responseCounts = await Response.aggregate([
      { $match: { postId: { $in: postIds } } },
      { $group: { _id: { postId: "$postId", type: "$type" }, count: { $sum: 1 } } }
    ]);

    const barterCounts = await Barter.aggregate([
      { $match: { postId: { $in: postIds } } },
      { $group: { _id: { postId: "$postId", status: "$status" }, count: { $sum: 1 } } }
    ]);

    const countsByPostId = new Map();

    const getCounts = (postId) => {
      const key = postId.toString();

      if (!countsByPostId.has(key)) {
        countsByPostId.set(key, {
          requestCount: 0,
          offerCount: 0,
          activeBarterCount: 0,
          acceptedBarterCount: 0
        });
      }

      return countsByPostId.get(key);
    };

    for (const { _id, count } of responseCounts) {
      const counts = getCounts(_id.postId);

      if (_id.type === "request") counts.requestCount = count;
      if (_id.type === "offer") counts.offerCount = count;
    }

    for (const { _id, count } of barterCounts) {
      const counts = getCounts(_id.postId);

      if (_id.status !== "rejected") counts.activeBarterCount += count;
      if (_id.status === "accepted") counts.acceptedBarterCount = count;
    }

    const postsWithCounts = posts.map((post) => ({
      ...post,
      ...getCounts(post._id)
    }));

    res.status(200).json(postsWithCounts);

  } catch (error) {
    console.error("GET POSTS ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch posts"
    });
  }
};

const getPostsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const posts = await Post.find({
      creatorId: userId
    })
      .populate("creatorId", "username")
      .sort({ createdAt: -1 })
      .lean();

    const postIds = posts.map((post) => post._id);

    const responseCounts = await Response.aggregate([
      { $match: { postId: { $in: postIds } } },
      { $group: { _id: { postId: "$postId", type: "$type" }, count: { $sum: 1 } } }
    ]);

    const barterCounts = await Barter.aggregate([
      { $match: { postId: { $in: postIds } } },
      { $group: { _id: { postId: "$postId", status: "$status" }, count: { $sum: 1 } } }
    ]);

    const countsByPostId = new Map();

    const getCounts = (postId) => {
      const key = postId.toString();

      if (!countsByPostId.has(key)) {
        countsByPostId.set(key, {
          requestCount: 0,
          offerCount: 0,
          activeBarterCount: 0,
          acceptedBarterCount: 0
        });
      }

      return countsByPostId.get(key);
    };

    for (const { _id, count } of responseCounts) {
      const counts = getCounts(_id.postId);

      if (_id.type === "request") counts.requestCount = count;
      if (_id.type === "offer") counts.offerCount = count;
    }

    for (const { _id, count } of barterCounts) {
      const counts = getCounts(_id.postId);

      if (_id.status !== "rejected") counts.activeBarterCount += count;
      if (_id.status === "accepted") counts.acceptedBarterCount = count;
    }

    const postsWithCounts = posts.map((post) => ({
      ...post,
      ...getCounts(post._id)
    }));

    res.status(200).json(postsWithCounts);

  } catch (error) {
    console.error("GET POSTS BY USER ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch posts"
    });
  }
};

const getEngagedPosts = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }

    const engagedPostIds = await Barter.distinct("postId", {
      creatorId: req.user.id
    });

    const posts = await Post.find({
      _id: { $in: engagedPostIds },
      status: { $in: ["open", "closed"] }
    })
      .populate("creatorId", "username")
      .sort({ createdAt: -1 })
      .lean();

    const postIds = posts.map((post) => post._id);

    const responseCounts = await Response.aggregate([
      { $match: { postId: { $in: postIds } } },
      { $group: { _id: { postId: "$postId", type: "$type" }, count: { $sum: 1 } } }
    ]);

    const barterCounts = await Barter.aggregate([
      { $match: { postId: { $in: postIds } } },
      { $group: { _id: { postId: "$postId", status: "$status" }, count: { $sum: 1 } } }
    ]);

    const countsByPostId = new Map();

    const getCounts = (postId) => {
      const key = postId.toString();

      if (!countsByPostId.has(key)) {
        countsByPostId.set(key, {
          requestCount: 0,
          offerCount: 0,
          activeBarterCount: 0,
          acceptedBarterCount: 0
        });
      }

      return countsByPostId.get(key);
    };

    for (const { _id, count } of responseCounts) {
      const counts = getCounts(_id.postId);

      if (_id.type === "request") counts.requestCount = count;
      if (_id.type === "offer") counts.offerCount = count;
    }

    for (const { _id, count } of barterCounts) {
      const counts = getCounts(_id.postId);

      if (_id.status !== "rejected") counts.activeBarterCount += count;
      if (_id.status === "accepted") counts.acceptedBarterCount = count;
    }

    const postsWithCounts = posts.map((post) => ({
      ...post,
      ...getCounts(post._id)
    }));

    const openPosts = postsWithCounts.filter((post) => post.status === "open");
    const closedPosts = postsWithCounts.filter((post) => post.status === "closed");

    res.status(200).json({
      open: openPosts,
      closed: closedPosts
    });

  } catch (error) {
    console.error("GET ENGAGED POSTS ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch engaged posts"
    });
  }
};

const getPostById = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId).populate("creatorId", "username");

    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    const responses = await Response.find({ postId });

    const requests = responses.filter((response) => response.type === "request");
    const offers = responses.filter((response) => response.type === "offer");

    const barters = await Barter.find({ postId }).populate("creatorId", "username");

    res.status(200).json({
      post,
      requests,
      offers,
      barters
    });

  } catch (error) {
    console.error("GET POST BY ID ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch post"
    });
  }
};

// Reconciles the Response docs of one type ("request" or "offer") for a post
// against the submitted items: updates existing pending ones, creates new
// ones, and deletes pending ones that were dropped. Accepted/rejected
// responses are never modified or deleted, whether or not they're submitted.
const syncResponses = async (postId, creatorId, type, submittedItems) => {
  const existingResponses = await Response.find({ postId, type });
  const existingById = new Map(
    existingResponses.map((response) => [response._id.toString(), response])
  );

  const keptIds = new Set();

  for (const item of submittedItems) {
    if (item._id) {
      const existing = existingById.get(item._id.toString());

      if (!existing) {
        throw new Error("Invalid response id");
      }

      keptIds.add(existing._id.toString());

      if (existing.status !== "pending") {
        continue;
      }

      existing.description = item.description;
      existing.category = item.category;
      await existing.save();
    } else {
      await Response.create({
        postId,
        creatorId,
        type,
        description: item.description,
        category: item.category,
      });
    }
  }

  for (const existing of existingResponses) {
    if (existing.status !== "pending") {
      continue;
    }

    if (!keptIds.has(existing._id.toString())) {
      await existing.deleteOne();
    }
  }
};

const updatePost = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const post = await Post.findById(postId);

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

    if (post.status === "cancelled") {
      return res.status(400).json({
        message: "Cancelled posts cannot be edited"
      });
    }

    const { title, description, deadline, maxMatches, requests, offers } = req.body;

    if (deadline !== undefined && deadline !== null && deadline !== "") {
      const deadlineError = validateDeadline(deadline);

      if (deadlineError) {
        return res.status(400).json({
          message: deadlineError
        });
      }
    }

    let acceptedCount;

    if (maxMatches !== undefined) {
      acceptedCount = await Barter.countDocuments({
        postId: post._id,
        status: "accepted"
      });

      if (maxMatches < acceptedCount) {
        return res.status(400).json({
          message: `maxMatches cannot be lower than the current number of accepted barters (${acceptedCount})`
        });
      }
    }

    if (title !== undefined) post.title = title;
    if (description !== undefined) post.description = description;
    if (deadline !== undefined) post.deadline = deadline;
    if (maxMatches !== undefined) post.maxMatches = maxMatches;

    if (maxMatches !== undefined && post.status === "closed") {
      const deadlinePassed = post.deadline && post.deadline < new Date();

      if (acceptedCount < post.maxMatches && !deadlinePassed) {
        post.status = "open";
      }
    } else if (maxMatches !== undefined && post.status === "open" && acceptedCount === post.maxMatches) {
      post.status = "closed";
    }

    if (requests !== undefined) {
      await syncResponses(postId, req.user.id, "request", requests);
    }

    if (offers !== undefined) {
      await syncResponses(postId, req.user.id, "offer", offers);
    }

    await post.save();

    res.status(200).json({
      message: "Post updated successfully",
      post,
    });

  } catch (error) {
    console.error("UPDATE POST ERROR:", error);

    res.status(500).json({
      message: "Failed to update post"
    });
  }
};

const cancelPost = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const post = await Post.findById(postId);

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

    if (post.status === "cancelled") {
      return res.status(400).json({
        message: "Post is already cancelled"
      });
    }

    if (post.status === "closed") {
      return res.status(400).json({
        message: "Closed posts cannot be cancelled"
      });
    }

    post.status = "cancelled";
    await post.save();

    res.status(200).json({
      message: "Post cancelled successfully",
      post,
    });

  } catch (error) {
    console.error("CANCEL POST ERROR:", error);

    res.status(500).json({
      message: "Failed to cancel post"
    });
  }
};

const uncancelPost = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const post = await Post.findById(postId);

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

    if (post.status !== "cancelled") {
      return res.status(400).json({
        message: "Only cancelled posts can be uncancelled"
      });
    }

    if (post.deadline && post.deadline < new Date()) {
      return res.status(400).json({
        message: "Post deadline has already passed"
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

    post.status = "open";
    await post.save();

    res.status(200).json({
      message: "Post uncancelled successfully",
      post,
    });

  } catch (error) {
    console.error("UNCANCEL POST ERROR:", error);

    res.status(500).json({
      message: "Failed to uncancel post"
    });
  }
};

module.exports = {
  createPost,
  getPosts,
  getPostsByUser,
  getEngagedPosts,
  getPostById,
  updatePost,
  cancelPost,
  uncancelPost
};
