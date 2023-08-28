require('dotenv').config('./.env');

const user = require('../models/user');
const aws = require('./aws');
const common = require('../util/common');
const bcrypt = require('bcrypt');
var randomstring = require("randomstring");
const saltRounds = parseInt(process.env.SALTROUNDS);
const dbError = {'message': 'Error connecting to database. Please contact admin.'};

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

                const newUser = new user({
                    fName: userDetails.fName,
                    lName: userDetails.lName,
                    email: userDetails.email,
                    passwordHash: hashedPassword,
                    darkModeState: userDetails.darkModeState,
                    userID: randomstring.generate(20).toUpperCase()
                });
                
                newUser.save()
                .then(() => {
                    common.genSuccessMessage(success, messageId, recpId);
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

module.exports = {
    registerUser
}