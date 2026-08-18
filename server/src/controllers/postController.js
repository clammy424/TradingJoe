const Post = require('../models/Post');

// TODO: Create a new post
const createPost = async (req, res) => {
    try {
        // 1. Get data from request
        const { title, 
            description, 
            requests, 
            offers, 
            deadline, 
            maxMatches
        } = req.body;

        // 2. Make sure user is authenticated
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        // 3. Verify required fields
        if (!title || !requests || !offers) {
            return res.status(400).json({
                message: "Missing required fields",
            });
        }
        
        // 4. Create Post
        const post = await Post.create({
            creatorID: req.user.id,
            title,
            description,
            requests,
            offers,
            deadline,
            maxMatches,
            status
        });

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

// TODO: Edit an existing post

module.exports = {
  createPost
};
