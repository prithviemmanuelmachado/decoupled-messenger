require('dotenv').config('./.env');

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const database = require('./models/init');
const router = require('./routes/index');
const aws = require('./routes/aws');

const port = 80;
const app = express();

app.use(cors());
app.use(bodyParser.json());

database.init((err) => {
  console.log('in db connect');
  if(!err){
    app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
      setInterval(() => {
        console.log('test');
        aws.receiveMessage((err) => {
          aws.logError(err, 'Index', 'ReciveMessage');
        }, (data) => {
          if(data.Messages){
            data.Messages.forEach(message => {
              router.Entry(message)
            });
          }
        })
      }, 3000)
    });
  }else{aws.logError(err, 'Index', 'DatabaseInit')}
});

process.on('SIGINT', database.closeConnection);