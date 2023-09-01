const aws = require('./aws');
const user = require('./user');
const auth = require('../util/auth');
const common = require('../util/common');

function Entry(message){
    if(message.MessageAttributes.method.StringValue === 'register'){
        user.registerUser(JSON.parse(message.Body), message.MessageId, message.ReceiptHandle);
    }
    else if(message.MessageAttributes.method.StringValue === 'login'){
        user.loginUser(JSON.parse(message.Body), message.MessageId, message.ReceiptHandle);
    }
    else{
        const decoded = auth(message.MessageAttributes.token.StringValue);
        if (Date.now() >= decoded.exp * 1000) { // jwt exp stores in seconds where as Date.now is in milliseconds
            common.genErrorMessage(
                '401', 
                {'message': 'Session expired. Logging you out'}, 
                undefined,  
                message.ReceiptHandle,
                message.MessageAttributes.sessionUrl.StringValue
            )
        }else{
            if(message.MessageAttributes.controller.StringValue === 'user'){
                if(message.MessageAttributes.method.StringValue === 'logout'){
                    user.logout(JSON.parse(message.Body), message.ReceiptHandle, decoded);
                }
                if(message.MessageAttributes.method.StringValue === 'setDarkModeState'){
                    user.setDarkModeState(JSON.parse(message.Body), message.ReceiptHandle, decoded);
                }
                if(message.MessageAttributes.method.StringValue === 'searchUser'){
                    user.searchUser(
                        JSON.parse(message.Body), 
                        message.MessageId, 
                        message.ReceiptHandle, 
                        decoded,
                        message.MessageAttributes.sessionUrl.StringValue
                    );
                }
            }
            if(message.MessageAttributes.controller.StringValue === 'message'){
                if(message.MessageAttributes.method.StringValue === 'add'){
                    user.searchUser(
                        JSON.parse(message.Body), 
                        message.ReceiptHandle, 
                        decoded,
                        message.MessageAttributes.sessionUrl.StringValue
                    );
                }
                if(message.MessageAttributes.method.StringValue === 'selectSearchUser'){
                    user.selectSearchUser(
                        JSON.parse(message.Body), 
                        message.ReceiptHandle, 
                        decoded,
                        message.MessageAttributes.sessionUrl.StringValue
                    );
                }
                if(message.MessageAttributes.method.StringValue === 'markMessagesAsRead'){
                    user.selectSearchUser(
                        JSON.parse(message.Body), 
                        message.ReceiptHandle, 
                        decoded
                    );
                }
            }
        }
    }
    
}

module.exports= {
    Entry
}