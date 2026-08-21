const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    barterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Barter',
        required: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true,
        trim: true
    }
}, { timestamps: true });

// 2. Create the model and export it
// 'Message' will automatically map to a plural collection named 'messages' in MongoDB
const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
