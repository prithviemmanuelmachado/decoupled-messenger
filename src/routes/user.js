require('dotenv').config('./.env');

const user = require('../models/user');
const aws = require('./aws');
const common = require('../util/common');
const bcrypt = require('bcrypt');
var randomstring = require("randomstring");
const jwt = require('jsonwebtoken');
const auth = require('../util/auth');

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
                    common.genErrorMessage('500', dbError, messageId, recpId);
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
                        common.genSuccessMessage(success, messageId, recpId);
                        return;
                    }, (err) => console.log(err))
                    return;              
                })
                .catch((err) => {
                    common.genErrorMessage('500', dbError, messageId, recpId);
                    return;
                })
            }).catch((err) => {
                common.genErrorMessage('500', dbError, messageId, recpId);
                return;
            }); 
        }
        else
        {
            common.genErrorMessage('400', userError, messageId, recpId);
            return;
        }
    }).catch((err) => {
        common.genErrorMessage('500', dbError, messageId, recpId);
        return;
    });
}

function loginUser(userDetails, messageId, recpId) {
    const userError = {'message' : 'Username does not exist'};
    const passError = {'message' : 'Password incorrect'};
    user.findOne({email: userDetails.email}).then((doc, err) => {
        if(err){
            common.genErrorMessage('500', dbError, messageId, recpId);
            return;
        }
        else{
            if(!doc){
                common.genErrorMessage('400', userError, messageId, recpId);
                return;
            }
            else{
                bcrypt.compare(userDetails.password, doc.passwordHash, (bErr, result) => {
                    if(bErr){
                        common.genErrorMessage('500', dbError, messageId, recpId);
                        return;
                    }
                    else{
                        if(result == true){
                            common.addNewActivityLog(doc.userID, 'USER', 'user login', () => {
                                const jwtToken = jwt.sign({
                                    userID: doc.userID
                                }, key, {
                                    expiresIn: jwtExpiresIn
                                });
                                common.genSuccessMessage({
                                    message: 'Login successful. Redirecting....',
                                    token: jwtToken,
                                    darkModeState: doc.darkModeState
                                }, messageId, recpId);
                                return;
                            }, (err) => console.log(err))
                            return;
                        }
                        else{
                            common.genErrorMessage('400', passError, messageId, recpId);
                            return;
                        }
                    }
                    
                });
                
            }
        }
    }).catch(err => {
        common.genErrorMessage('500', dbError, messageId, recpId);
        return;
    });
}

function logout(model, recpId) {
    const decoded = auth(model.token);
    common.addNewActivityLog(decoded.userID, 'USER', 'user logout', () => {
        aws.deleteMessage(recpId, err => console.log(err));
        return;
    }, (err) => console.log(err))
}

module.exports = {
    registerUser,
    loginUser,
    logout
}