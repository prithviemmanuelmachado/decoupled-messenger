const AWS = require('aws-sdk');

const REQURL = process.env.SERVER_REQ_QUEUE;
const RESURL = process.env.SERVER_RES_QUEUE;
const SQS_CONFIG = {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION,
};

const receiveMessageParams = {
    MaxNumberOfMessages: 10,
    VisibilityTimeout: 20,
    WaitTimeSeconds: 10,
    MessageAttributeNames: ['All'],
};
  
const sqs = new AWS.SQS(SQS_CONFIG);
  
function sendMessage(data, attributes = null, errorfnc, successfnc) {
    let params = {
        MessageBody: data,
        QueueUrl: RESURL,
    };
  
    if (attributes) {
      params.MessageAttributes = attributes;
    }

    sqs.sendMessage(params, function (err, data) {
      if (err) {
        errorfnc(err);
      } else {
        successfnc(data);
      }
    });
}

function receiveMessage(errfnc, successfnc){
    const params = {
      ...receiveMessageParams,
      QueueUrl: REQURL,
    };
  
    sqs.receiveMessage(params, (err, data) => {
      if (err) {
        errfnc(err);
      }
      else{
        successfnc(data)
      }
    });
};

function deleteMessage(id, errfnc){
  sqs.deleteMessage(
    {
      QueueUrl: REQURL,
      ReceiptHandle: id,
    },
    function (err, data) {
      if(err){
        errfnc(err);
      }
    }
  );
};

module.exports= {
    sendMessage,
    receiveMessage,
    deleteMessage
}