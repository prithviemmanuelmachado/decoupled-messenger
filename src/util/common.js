const aws = require('../routes/aws');
const activityLog = require('../models/activityLog');
var randomstring = require("randomstring");

function genErrorMessage(errCode, errorMsg, msgID, rcpId, url){
    aws.sendMessage(
        JSON.stringify(errorMsg), {
            statusCode:{
                DataType: 'String',
                StringValue: errCode
            },
            resTo:{
                DataType: 'String',
                StringValue: msgID
            }
        },
        (err) => {aws.logError(err, 'Message', 'AddMessage')},
        (data) => {aws.deleteMessage(rcpId, err => aws.logError(err, 'Message', 'AddMessage'))}, 
        url
    )
}

function genSuccessMessage(Msg, msgID, rcpId, url, action){
    let attrb = {
        statusCode:{
            DataType: 'String',
            StringValue: '200'
        }
    }
    if (msgID){
        attrb.resTo = {
            DataType: 'String',
            StringValue: msgID
        }
    }   
    if(action){
        attrb.action = {
            DataType: 'String',
            StringValue: action
        }
    }
    aws.sendMessage(
        JSON.stringify(Msg),
        attrb,
        (err) => {aws.logError(err, 'Message', 'AddMessage')},
        (data) => {
            if(rcpId){
                aws.deleteMessage(rcpId, err => aws.logError(err, 'Message', 'AddMessage'))
            }
        },
        url
    )
}

function addNewActivityLog (userID, category, action, success, errfnc){
    const log = new activityLog({
        logID: randomstring.generate(15).toUpperCase(),
        userID: userID,
        category: category,
        action: action
    })

    log.save().then(success).catch(err => errfnc(err))
}

module.exports = {
    genErrorMessage,
    genSuccessMessage,
    addNewActivityLog
}