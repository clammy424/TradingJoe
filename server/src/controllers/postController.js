const Post = require('../models/Post');
const Response = require('../models/Response');
const Barter = require('../models/Barter');


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
    }).sort({ createdAt: -1 });

    res.status(200).json(posts);

  } catch (error) {
    console.error("GET POSTS ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch posts"
    });
  }
};

const getPostById = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    const responses = await Response.find({ postId });

    const requests = responses.filter((response) => response.type === "request");
    const offers = responses.filter((response) => response.type === "offer");

    const barters = await Barter.find({ postId });

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

    if (maxMatches !== undefined) {
      const acceptedCount = await Barter.countDocuments({
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

module.exports = {
  createPost,
  getPosts,
  getPostById,
  updatePost
};
