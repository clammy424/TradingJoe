const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    deadline: {
        type: Date,
        required: false
    },
    maxMatches: {
        type: Number,
        required: false, 
        default: 1
    },
    status: {
        type: String,
        enum: ['open', 'closed', 'cancelled'],
        default: 'open'
    }
}, { timestamps: true });

// 2. Create the model and export it
// 'Post' will automatically map to a plural collection named 'posts' in MongoDB
const Post = mongoose.model('Post', postSchema);

module.exports = Post;