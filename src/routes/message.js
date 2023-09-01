const Message = require("../models/message");
const Session = require('../models/session');
const common = require('../util/common');
const randomstring = require("randomstring");
const aws = require('../util/auth');

function addMessage(model, recpId, decoded, url){
    //add message to database
    //check if the reciver of the message has an active session
    //if yes send it to that session 
    let newMessage = new Message({
        messageID: randomstring.generate(30).toUpperCase(),
        fromUserID: model.userID,
        fromName: model.name,
        toUserID: decoded.userID,
        toName: decoded.name,
        body: typeof model.body === 'string' ? model.body : null,
        attachment: typeof model.body === 'object' ? model.body : null
    });

    newMessage.save().then(() => {
        Session.findOne({userID: decoded.userID}).then((doc, err) => {
            if(err){aws.logError(err, 'Message', 'AddMessage');}
            if(doc.userID){
                common.genSuccessMessage(JSON.stringify({
                    body: model.body,
                    to: decoded.userID,
                    dateTime: newMessage.createdDateTime
                }), undefined, recpId, url, 'message');
            }
        }).catch(err => aws.logError(err, 'Message', 'AddMessage'));
    }).catch(err => aws.logError(err, 'Message', 'AddMessage'));

}

function markMessagesAsRead(model, recpId, decoded){
    //update all the messages from model.user to the requesting user as read
    Message.updateMany({
        $and: [
            {fromUserID: model.userID},
            {toUserID: decoded.userID}
        ]
    }, {isMessageRead: true}).then(data => null).catch(err => aws.logError(err, 'Message', 'MarkMessageAsRead'));
}

function selectSearchUser(model, recpId, decoded, url){
    Message.find({ $or: [
        {
            $and: [
                {fromUserID: decoded.userID},
                {toUserID: model.userID}
            ]
        },
        {
            $and: [
                {fromUserID: model.userID},
                {toUserID: decoded.userID}
            ]
        }
    ]}).sort({createdDateTime: -1}).limit(20).then((msgDoc, berr) => {
        if(!berr){
            var uMsgs = msgDoc.map(msg => {
                return {
                    body: msg.body !== null ? msg.body : msg.attachment,
                    to: fromUserID === decoded.userID ? null : fromUserID,
                    dateTime: createdDateTime,
                    isMessageRead: isMessageRead
                }
            })
            common.genSuccessMessage(JSON.stringify(uMsgs), undefined, recpId, url, 'selectSearchUser');
        }else{
            aws.logError(err, 'Message', 'SelectSearchUser');
        }
    }).catch(err => aws.logError(err, 'Message', 'SelectSearchUser'))
}

module.exports = {
    addMessage,
    selectSearchUser,
    markMessagesAsRead
}