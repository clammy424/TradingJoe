const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['request', 'offer'],
        required: true
    },
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String, 
        enum: ['food', 'education', 'items', 'transportation', 'services', 'leisure','other'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
}, {timestamps: true});

// 2. Create the model and export it
// 'Request' will automatically map to a plural collection named 'requests' in MongoDB
const Response = mongoose.model('Response', responseSchema);   

module.exports = Response;