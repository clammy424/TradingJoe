const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['undergrad', 'grad', 'professor', 'staff'],
        default: 'user'
    },
    gradYear: {
        type: Number,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true
    },
    profilePicture: {
        type: String,
        default: null
    }
});

// 2. Create the model and export it
// 'User' will automatically map to a plural collection named 'users' in MongoDB
const User = mongoose.model('User', userSchema);

module.exports = User;