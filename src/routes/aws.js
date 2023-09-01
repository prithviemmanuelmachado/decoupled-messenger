const AWS = require('aws-sdk');

const REQURL = process.env.SERVER_REQ_QUEUE;
const RESURL = process.env.SERVER_RES_QUEUE;
const CONFIG = {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION,
};
const sqs = new AWS.SQS(CONFIG);
const logs = new AWS.CloudWatchLogs(CONFIG);

const receiveMessageParams = {
    MaxNumberOfMessages: 10,
    VisibilityTimeout: 20,
    WaitTimeSeconds: 10,
    MessageAttributeNames: ['All'],
};
const logPrams = {
  logGroupName: process.env.LOGGROUP,
  logStreamName: process.env.LOGSTREAM
}
  
  
function sendMessage(data, attributes = null, errorfnc, successfnc, url) {
    let params = {
        MessageBody: data,
        QueueUrl: url === null ? RESURL : url,
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

function createQueue(userID, successfnc, errfnc){
  let d = new Date();
  var params = {
    QueueName: userID + '-' + d.getDate()  + '-' + (d.getMonth()+1) + '-' + d.getFullYear() + '-' + d.getHours() + '-' + d.getMinutes()
  };

  sqs.createQueue(params, (err, data) => {
    if(err) {
        errfnc(err);
    } 
    else {
        successfnc(data);
    } 
  });
}

function deleteQueue(url, errfnc){
  let params = {
    QueueUrl: url
  }

  sqs.deleteQueue(params, (err, data) => {
    if(err){
      errfnc(err);
    }
  })
}

function logError(err, controller, method){
  try{
    logs.putLogEvents({
      ...logPrams,
      logEvents: [{
        message: 'Controller: ' + controller + ' >>> Method: ' + method + ' >>> Error: ' + JSON.stringify(err.stack),
        timestamp: Date.now()
      }]
    }).promise();
  }catch (e){
    console.log(e)
  }
}

module.exports= {
  sendMessage,
  receiveMessage,
  deleteMessage,
  createQueue,
  deleteQueue,
  logError
}