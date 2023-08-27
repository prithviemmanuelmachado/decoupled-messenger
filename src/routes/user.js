require('dotenv').config('./.env');

const user = require('../models/user');
const bcrypt = require('bcrypt');
const express = require('express');
var randomstring = require("randomstring");
const router = express.Router();
const saltRounds = parseInt(process.env.SALTROUNDS);

router.post('/register', (req, res) =>{
    const userDetails = req.body;
    const success = {'success': 'User successfully created. Please login'};
    const userError = {'error': 'Email exists. Please try another.'};
    const dbError = {'error': 'Error connecting to database. Please contact admin.'};
    user.find({email: userDetails.email}).exec().then((doc) =>  {
        if(doc.length == 0)
        {
            bcrypt.hash(userDetails.password, saltRounds)
            .then((hashedPassword, err) => {
                if(err){
                    console.log(err);
                    res.status(500);
                    res.json(dbError);
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
                    res.status(200);
                    res.json(success);
                })
                .catch((err) => {
                    res.status(500);
                    res.json(dbError);
                })
            }).catch((err) => {
                console.log(err);
                res.status(500);
                res.json(dbError);
            }); 
        }
        else
        {
            res.status(400);
            res.json(userError);
        }
    }).catch((err) => {
        console.log(err);
        res.status(500);
        res.json(dbError);
    });
});

module.exports = router;