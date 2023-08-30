const aws = require('./aws');
const user = require('./user');

function Entry(message){
    if(message.MessageAttributes.controller.StringValue === 'user'){
        if(message.MessageAttributes.method.StringValue === 'register'){
            user.registerUser(JSON.parse(message.Body), message.MessageId, message.ReceiptHandle);
        }
        if(message.MessageAttributes.method.StringValue === 'login'){
            user.loginUser(JSON.parse(message.Body), message.MessageId, message.ReceiptHandle);
        }
        if(message.MessageAttributes.method.StringValue === 'logout'){
            user.logout(JSON.parse(message.Body), message.ReceiptHandle, message.MessageAttributes.token.StringValue);
        }
        if(message.MessageAttributes.method.StringValue === 'searchUser'){
            user.searchUser(
                JSON.parse(message.Body), 
                message.MessageId, 
                message.ReceiptHandle, 
                message.MessageAttributes.token.StringValue,
                message.MessageAttributes.sessionUrl.StringValue
            );
        }
    }
}

module.exports= {
    Entry
}