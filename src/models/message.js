const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    messageID: String,
    fromUserID: String,
    fromName: String,
    toUserID: String,
    toName: String,
    body: String,
    createdDateTime:{
        type: Date,
        default: Date.now()
    },
    isMessageRead: {
        type: Boolean,
        default: false
    }, 
    attachment: {
        url: {
            type: String
        },
        type: {
            type: String
        },
        size: {
            type: Number
        }
    },
    order: Number
});

const Message = mongoose.model('message', messageSchema);

module.exports = Message;