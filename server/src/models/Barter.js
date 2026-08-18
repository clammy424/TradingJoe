const mongoose = require('mongoose');

// - id
// - postId
// - creatorId
// - parentOfferId
// - description
// - status
// - createdAt
// - updatedAt

const barterSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    parentOfferId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Response',
        required: false
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
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
// 'Barter' will automatically map to a plural collection named 'barters' in MongoDB
const Barter = mongoose.model('Barter', barterSchema);

module.exports = Barter;