const aws = require('../routes/aws');

function genErrorMessage(errCode, errorMsg, msgID, rcpId){
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
        (err) => {console.log(err)},
        (data) => {aws.deleteMessage(rcpId, err => console.log(err))}
    )
}

function genSuccessMessage(Msg, msgID, rcpId){
    aws.sendMessage(
        JSON.stringify(Msg), {
            statusCode:{
                DataType: 'String',
                StringValue: '200'
            },
            resTo:{
                DataType: 'String',
                StringValue: msgID
            }
        },
        (err) => {console.log(err)},
        (data) => {aws.deleteMessage(rcpId, err => console.log(err))}
    )
}

module.exports = {
    genErrorMessage,
    genSuccessMessage
}