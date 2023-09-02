require('dotenv').config('./.env');

const user = require('../models/user');
const aws = require('./aws');
const common = require('../util/common');
const bcrypt = require('bcrypt');
const randomstring = require("randomstring");
const jwt = require('jsonwebtoken');
const Session = require('../models/session');
const Message = require('../models/message');

const saltRounds = parseInt(process.env.SALTROUNDS);
const dbError = {'message': 'Error connecting to database. Please contact admin.'};
const key = process.env.KEY;
const jwtExpiresIn = process.env.SESSIONEXP;

function registerUser(userDetails, messageId, recpId){
    const success = {'message': 'User successfully created. Please login'};
    const userError = {'message': 'Email exists. Please try another.'};
    
    user.find({email: userDetails.email}).exec().then((doc) =>  {
        if(doc.length == 0)
        {
            bcrypt.hash(userDetails.password, saltRounds)
            .then((hashedPassword, err) => {
                if(err){
                    aws.logError(err, 'User', 'Register');
                    common.genErrorMessage('500', dbError, messageId, recpId, null);
                    return;
                }
                const userID = randomstring.generate(20).toUpperCase();

                const newUser = new user({
                    fName: userDetails.fName,
                    lName: userDetails.lName,
                    email: userDetails.email,
                    passwordHash: hashedPassword,
                    darkModeState: userDetails.darkModeState,
                    userID: userID
                });
                
                newUser.save()
                .then(() => {
                    common.addNewActivityLog(userID, 'USER', 'account crated', () => {
                        common.genSuccessMessage(success, messageId, recpId, null);
                        return;
                    }, (err) => aws.logError(err, 'User', 'Register'))
                    return;              
                })
                .catch((err) => {
                    aws.logError(err, 'User', 'Register');
                    common.genErrorMessage('500', dbError, messageId, recpId, null);
                    return;
                })
            }).catch((err) => {
                aws.logError(err, 'User', 'Register');
                common.genErrorMessage('500', dbError, messageId, recpId, null);
                return;
            }); 
        }
        else
        {
            common.genErrorMessage('400', userError, messageId, recpId, null);
            return;
        }
    }).catch((err) => {
        aws.logError(err, 'User', 'Register');
        common.genErrorMessage('500', dbError, messageId, recpId, null);
        return;
    });
}

function loginUser(userDetails, messageId, recpId) {
    const userError = {'message' : 'Username does not exist'};
    const passError = {'message' : 'Password incorrect'};
    user.findOne({email: userDetails.email}).then((doc, err) => {
        if(err){
            aws.logError(err, 'User', 'Login');
            common.genErrorMessage('500', dbError, messageId, recpId, null);
            return;
        }
        else{
            if(!doc){
                common.genErrorMessage('400', userError, messageId, recpId, null);
                return;
            }
            else{
                bcrypt.compare(userDetails.password, doc.passwordHash, (bErr, result) => {
                    if(bErr){
                        common.genErrorMessage('500', dbError, messageId, recpId, null);
                        return;
                    }
                    else{
                        if(result == true){
                            //if all checks out log activity
                            common.addNewActivityLog(doc.userID, 'USER', 'user login', () => {
                                //create new queue for session
                                aws.createQueue(doc.userID, (data) => {
                                    //log session
                                    const sessionID = randomstring.generate(10).toUpperCase();
                                    const newSession = new Session({
                                        sessionID: sessionID,
                                        userID: doc.userID,
                                        sessionUrl: data.QueueUrl
                                    });
                                    newSession.save()
                                    .then(() => {
                                        const jwtToken = jwt.sign({
                                            userID: doc.userID,
                                            name: doc.fName+' '+doc.lName
                                        }, key, {
                                            expiresIn: jwtExpiresIn
                                        });

                                        //get users with unread messages for session
                                        if(doc.logoutDateTime === null){
                                            Message.find({ $or: [
                                                {fromUserID: doc.userID},
                                                {toUserID: doc.userID}
                                            ]}).then((msgsDoc, err) => {
                                                if(err){aws.logError(err, 'User', 'SearchUser');}
                                                else{
                                                    msgsDoc.forEach(msg => {
                                                        common.genSuccessMessage({
                                                            body: msg.body !== null ? msg.body : msg.attachment,
                                                            to: msg.fromUserID === decoded.userID ? msg.toUserID : null,
                                                            dateTime: new Date(msg.createdDateTime),
                                                            isMessageRead: msg.isMessageRead
                                                        }, undefined, undefined, data.QueueUrl, 'message');
                                                    })
                                                }
                                            }).catch(err => aws.logError(err, 'User', 'Login'));
                                        }else{
                                            Message.find({$and: [
                                                { $or: [
                                                    {fromUserID: doc.userID},
                                                    {toUserID: doc.userID}
                                                ]},
                                                { createdDateTime: {$gte: doc.logoutDateTime} }
                                            ]}).then((tmsgDoc, terr) => {
                                                if(terr) {aws.logError(terr, 'User', 'Login');}
                                                if(tmsgDoc.length > 100){
                                                    tmsgDoc.forEach(msg => {
                                                        common.genSuccessMessage({
                                                            body: msg.body !== null ? msg.body : msg.attachment,
                                                            to: msg.fromUserID === decoded.userID ? msg.toUserID : null,
                                                            dateTime: new Date(msg.createdDateTime),
                                                            isMessageRead: msg.isMessageRead
                                                        }, undefined, undefined, data.QueueUrl, 'message');
                                                    })
                                                }else{
                                                    Message.find({ $or: [
                                                        {fromUserID: doc.userID},
                                                        {toUserID: doc.userID}
                                                    ]}).sort({createdDateTime: -1}).limit(100).then((bmsgDoc, berr) => {
                                                        if(!berr){
                                                            bmsgDoc.forEach(msg => {
                                                                common.genSuccessMessage({
                                                                    body: msg.body !== null ? msg.body : msg.attachment,
                                                                    to: msg.fromUserID === decoded.userID ? msg.toUserID : null,
                                                                    dateTime: new Date(msg.createdDateTime),
                                                                    isMessageRead: msg.isMessageRead
                                                                }, undefined, undefined, data.QueueUrl, 'message');
                                                            })
                                                        }else{
                                                            aws.logError(berr, 'User', 'Login');
                                                        }
                                                    }).catch(err => aws.logError(err, 'User', 'Login'))
                                                }
                                            }).catch(err => aws.logError(err, 'User', 'Login'));
                                        }

                                        //send response
                                        common.genSuccessMessage({
                                            message: 'Login successful. Redirecting....',
                                            token: jwtToken,
                                            darkModeState: doc.darkModeState,
                                            url: data.QueueUrl
                                        }, messageId, recpId, null);
                                        return;              
                                    })
                                    .catch((err) => {
                                        aws.logError(err, 'User', 'Login');
                                        common.genErrorMessage('500', dbError, messageId, recpId, null);
                                        return;
                                    })
                                }, (err) => aws.logError(err, 'User', 'Login'))
                                return;
                            }, (err) => aws.logError(err, 'User', 'Login'))
                            return;
                        }
                        else{
                            common.genErrorMessage('400', passError, messageId, recpId, null);
                            return;
                        }
                    }
                    
                });
                
            }
        }
    }).catch(err => {
        aws.logError(err, 'User', 'Login');
        common.genErrorMessage('500', dbError, messageId, recpId, null);
        return;
    });
}

function logout(model, recpId, decoded) {
    Session.deleteMany({userID: decoded.userID}).then(data => {
        user.findOneAndUpdate({userID: decoded.userID}, { $set : {
            logoutDateTime: Date.now()
        }}).then((doc) => {
            common.addNewActivityLog(decoded.userID, 'USER', 'user logout', () => {
                aws.deleteQueue(model.url, err => aws.logError(err, 'User', 'Logout'));
                aws.deleteMessage(recpId, err => aws.logError(err, 'User', 'Logout'));
                return;
            }, (err) => aws.logError(err, 'User', 'Logout'))
        })        
    }).catch(err => aws.logError(err, 'User', 'Logout'))
}

function setDarkModeState(model, recpId, decoded) {
    user.findOneAndUpdate({userID: decoded.userID}, { $set : {
        darkModeState: model.darkModeState
    }}).then((doc) => {
        aws.deleteMessage(recpId, err => aws.logError(err, 'User', 'SetDarkModeState'));
    }) 
}

function searchUser(model, messageId, recpId, decoded, url){
    user.find({
        $and: [
            {
                $or: [
                    {fName: { '$regex': model.name, '$options': 'i' }},
                    {lName: { '$regex': model.name, '$options': 'i' }}
                ]
            },
            {
                userID: {$ne: decoded.userID}
            }
        ]
    }).then((doc, err) => {
        if(err){
            aws.logError(err, 'User', 'SearchUser');
            common.genErrorMessage('500', dbError, messageId, recpId, url, 'searchUser');
            return;
        }
        else{
            common.genSuccessMessage({
                listOfUsers: doc.map(ele => {
                    return {
                        name: ele.fName + ' ' + ele.lName,
                        unreadMessages: -1,
                        userID: ele.userID
                    }
                })
            }, messageId, recpId, url, 'searchUser');
            return;
        }
    }).catch(err => {
        aws.logError(err, 'User', 'SearchUser');
        common.genErrorMessage('500', dbError, messageId, recpId, url, 'searchUser');
        return;
    })
}

module.exports = {
    registerUser,
    loginUser,
    logout,
    searchUser,
    setDarkModeState
}