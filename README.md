# decoupled-messenger-server
> **Find the frontend code in this link: https://github.com/prithviemmanuelmachado/decoupled-messenger-app**
<br/><br/>

## **Huzza. All core functions working as required**. Project has concluded

## Overview
**Note: This is not a responsive app as that is not the goal of this exercise. The main goals of this project is**

> * Build a cloud native app<br />
> * Have the front end and the back end decoaupled using AWS SQS<br />
> * Use AWS S3 as a storage<br />
> * Implement CICD using code pipeline<br />
> * Use Cloudformation to demonstrate use of Infrastructure as code<br />

## Order to read the files to understand flow
1. /src/index.js
2. /src/models
3. /src/util
4. /src/routes

## Environment varaiables
The environment variables need to be placed in a .env file in the root folder, here /src<br />
The following variables are used 
* SERVER_REQ_QUEUE= --url of the queues holding the requests--
* SERVER_RES_QUEUE=--url of the queues holding the requests--
* ACCESS_KEY=--access key generated for the aws account that can access the queues--
* SECRET_ACCESS_KEY=--secret key generated for the aws account that can access the queues--
* REGION=--aws region that holds the queue--
* DBSTRING=--db connection string to mongodb--
* SALTROUNDS=--number of salt rounds in bcrypt--
* KEY=--jwt token key--
* SESSIONEXP=--session time in jwt--
* LOGGROUP=--Cloud watch log group--
* LOGSTREAM=--Cloud watch log stream--

<br/>ACCESS_KEY, SECRET_ACCESS_KEY, REGION are needed only for local development. Since this is being hosted on AWS EC2, you can get away with making it so the role has permissions to access the required services, and based on an env pass config values or not to the aws sdk functions

## AWS services used
* SQS -> for messaging
* CloudWatch -> for logging
* Codepipeline -> for CICD

## AWS related prep WRT server function
> **Note: Logging is implemented only for the server side**
* Setup for common functions that deal with sqs messaging is done in src/routes/aws.js
* Create 2 queues to hold request and response. Note, that the recommended method is to create a new queue once the server finishes processing the message and pass the url back to the requesting client to poll the response. This is recommended since AWS charges per poll on sqs and not per queue. Here, I tried to limit to 2 queues upto login
* The new queue per reponse also helps with security as not all machines can see all responses
* Ideal architecture from my limited, beginner level understanding: 
    * Login and register or any other user related activity that requires immediate response needs to be tightly coupled with server
    * On completion of login, create queue and return link with response
    * All subsequent response need to be sent to that particular queue for that particular user. The user queue relation can be intimated through cookies
* Here a dead letter queue is not implemented, but should be straight forward enough to implement 
* Create a cloud watch log group and stream

## AWS related prep WRT CICD
* Create parameters in SSM for .env vars
* Deploy the infrastructure using the cloud formation template > modify the template as needed
* Create a connection to the github project 
* Create code build project with the env variables used, point it to the SSM parameter store, make sure the build project role has ssm and s3 permissions
* Create code deploy project with target as the infra created above
* Create code pipeline that ties all these together

## About the server
* The server polls for messages every 3 seconds. The frequency can be altered in the setInterval function in /src/index.js
* Since WaitTimeSeconds param for the reciveMessage method in /src/routes/aws.js is set to > 0 then we can have it be a recurring fucntion, instead of running on a timer, and achive the same result. It is a matter of preferance.
* A new queue is created per session on login and deleted on logout
* On login we send all the messages since last login if there are more than 100 since last logout messages. else send last 100 messages
* Every subsequent application message is sent in an individual sqs message and appanded to the correct user

## Request/response format
* The request messages usually have the following 
    * body
    * attribute
        * controller
        * method
        * token
* The response for the server queue is as follows 
    * body
    * attribute
        * resTo -> MessageID of the request message
        * statusCode -> HTTP status code
* The response for the session queue is as follows
    * body
    * attribute
        * statusCode -> HTTP status code
        * action -> to tell the consumer what this message is for 