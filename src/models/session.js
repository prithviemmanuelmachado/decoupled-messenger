const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    sessionID: String,
    userID: String,
    sessionUrl: String
});

const Session = mongoose.model('session', sessionSchema);

module.exports = Session;