# decoupled-messenger-server
> **Find the frontend code in this link: https://github.com/prithviemmanuelmachado/decoupled-messenger-app**
<br/><br/>

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

## AWS related prep
* Setup for common functions that deal with sqs messaging is done in src/routes/aws.js
* Create 2 queues to hold request and response. Note, that the recommended method is to create a new queue once the server finishes processing the message and pass the url back to the requesting client to poll the response. This is recommended since AWS charges per poll on sqs and not per queue. Here, I tried to limit to 2 queues to try some alternative methods

## About the server
* The server polls for messages every 3 seconds. The frequency can be altered in the setInterval function in /src/index.js
* Since WaitTimeSeconds param for the reciveMessage method in /src/routes/aws.js is set to > 0 then we can have it be a recurring fucntion, instead of running on a timer, and achive the same result. It is a matter of preferance.
