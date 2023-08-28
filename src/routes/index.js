const aws = require('./aws');
const user = require('./user');

function Entry(message){
    if(message.MessageAttributes.controller.StringValue === 'user'){
        if(message.MessageAttributes.method.StringValue === 'register'){
            user.registerUser(JSON.parse(message.Body), message.MessageId, message.ReceiptHandle);
        }
    }
}

module.exports= {
    Entry
}