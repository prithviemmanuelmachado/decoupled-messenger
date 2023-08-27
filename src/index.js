require('dotenv').config('./.env');

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const database = require('./models/init');
const router = require('./routes');

const port = 80;
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(router);

database.init((err) => {
  if(!err){
    app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
    });
  }
});

process.on('SIGINT', database.closeConnection);