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
  if(!err){
    app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
      setInterval(() => {
        aws.receiveMessage((err) => {
          console.log(err)
        }, (data) => {
          if(data.Messages){
            router.Entry(data.Messages[0])
          }
        })
      }, 3000)
    });
  }
});

process.on('SIGINT', database.closeConnection);