const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    logID: String,
    userID: String,
    category: String,
    action: String,
    activityDateTime:{
        type: Date,
        default: Date.now()
    } 
});

const ActivityLog = mongoose.model('activityLog', activityLogSchema);

module.exports = ActivityLog;