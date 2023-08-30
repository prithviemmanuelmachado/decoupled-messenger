const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    messageID: String,
    fromUserID: String,
    toUserID: String,
    body: String,
    createdDateTime:{
        type: Date,
        default: Date.now()
    },
    isMessageRead: {
        type: Boolean,
        default: false
    } 
});

const Message = mongoose.model('message', messageSchema);

module.exports = Message;