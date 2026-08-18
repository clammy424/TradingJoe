const mongoose = require('mongoose');


// - id
// - creatorId
// - title
// - description
// - category
// - customCategory
// - requests[]
// - deadline
// - maxMatches
// - status
// - createdAt
// - updatedAt

const postSchema = new mongoose.Schema({
    creatorID: {
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
        required: false
    },
    requests: [{type: mongoose.Schema.Types.ObjectId, ref: 'Response'}],
    offers: [{type: mongoose.Schema.Types.ObjectId, ref: 'Response'}],
    deadline: {
        type: Date,
        required: false
    },
    maxMatches: {
        type: Number,
        required: false
    },
    status: {
        type: String,
        enum: ['open', 'closed', 'cancelled'],
        default: 'open'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true
    },
    updatedAt: {
        type: Date,
        default: Date.now,
        required: true
    }
});

// 2. Create the model and export it
// 'Post' will automatically map to a plural collection named 'posts' in MongoDB
const Post = mongoose.model('Post', postSchema);

module.exports = Post;