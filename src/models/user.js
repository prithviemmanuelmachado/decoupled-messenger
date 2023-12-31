const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userID: String,
    email: String,
    fName: String,
    lName: String,
    darkModeState: Boolean,
    passwordHash: String,
    logoutDateTime: Date
});

const User = mongoose.model('user', userSchema);

module.exports = User;