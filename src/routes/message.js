const Message = require("../models/message");
const Session = require('../models/session');
const common = require('../util/common');
const randomstring = require("randomstring");

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
            if(doc.userID){
                common.genSuccessMessage(JSON.stringify({
                    body: model.body,
                    to: decoded.userID,
                    dateTime: newMessage.createdDateTime
                }), undefined, recpId, url, 'message');
            }
        }).catch(err => null);
    }).catch(err => null);

}

function markMessagesAsRead(model, recpId, decoded){
    //update all the messages from model.user to the requesting user as read
    Message.updateMany({
        $and: [
            {fromUserID: model.userID},
            {toUserID: decoded.userID}
        ]
    }, {isMessageRead: true}).then(data => console.log(data)).catch(err => console.log(err));
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
            var uMsgs = bmsgDoc.map(msg => {
                return {
                    body: msg.body !== null ? msg.body : msg.attachment,
                    to: fromUserID === decoded.userID ? null : fromUserID,
                    dateTime: createdDateTime,
                    isMessageRead: isMessageRead
                }
            })
            common.genSuccessMessage(JSON.stringify(uMsgs), undefined, recpId, url, 'selectSearchUser');
        }
    }).catch(err => null)
}

module.exports = {
    addMessage,
    selectSearchUser,
    markMessagesAsRead
}