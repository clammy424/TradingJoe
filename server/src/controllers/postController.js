const Post = require('../models/Post');
const Response = require('../models/Response');


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

    res.status(200).json({
      post,
      requests,
      offers
    });

  } catch (error) {
    console.error("GET POST BY ID ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch post"
    });
  }
};

// TODO: Edit an existing post

module.exports = {
  createPost,
  getPosts,
  getPostById
};
