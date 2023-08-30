require('dotenv').config('./.env');

const user = require('../models/user');
const aws = require('./aws');
const common = require('../util/common');
const bcrypt = require('bcrypt');
var randomstring = require("randomstring");
const jwt = require('jsonwebtoken');
const auth = require('../util/auth');
const Session = require('../models/session');
const message = require('../models/message');

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
                    }, (err) => console.log(err))
                    return;              
                })
                .catch((err) => {
                    common.genErrorMessage('500', dbError, messageId, recpId, null);
                    return;
                })
            }).catch((err) => {
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
        common.genErrorMessage('500', dbError, messageId, recpId, null);
        return;
    });
}

function loginUser(userDetails, messageId, recpId) {
    const userError = {'message' : 'Username does not exist'};
    const passError = {'message' : 'Password incorrect'};
    user.findOne({email: userDetails.email}).then((doc, err) => {
        if(err){
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
                                            userID: doc.userID
                                        }, key, {
                                            expiresIn: jwtExpiresIn
                                        });
                                        //get users with unread messages for session
                                           //Work in progress
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
                                        common.genErrorMessage('500', dbError, messageId, recpId, null);
                                        return;
                                    })
                                }, (err) => console.log(err))
                                return;
                            }, (err) => console.log(err))
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
        common.genErrorMessage('500', dbError, messageId, recpId, null);
        return;
    });
}

function logout(model, recpId, token) {
    const decoded = auth(token);
    Session.deleteMany({userID: decoded.userID}).then(data => {
        common.addNewActivityLog(decoded.userID, 'USER', 'user logout', () => {
            aws.deleteQueue(model.url, err => console.log(err));
            aws.deleteMessage(recpId, err => console.log(err));
            return;
        }, (err) => console.log(err))
    }).catch(err => console.log(err))
}

function searchUser(model, messageId, recpId, token, url){
    const decoded = auth(token);
    user.findOne({
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
            common.genErrorMessage('500', dbError, messageId, recpId, url);
            return;
        }
        else{
            console.log(doc)
            common.genSuccessMessage({
                listOfUsers: doc
            }, messageId, recpId, url);
            return;
        }
    }).catch(err => {
        common.genErrorMessage('500', dbError, messageId, recpId, url);
        return;
    })
}

module.exports = {
    registerUser,
    loginUser,
    logout,
    searchUser
}