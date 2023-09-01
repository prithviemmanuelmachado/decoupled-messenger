require('dotenv').config('./.env');

const mongoose = require('mongoose');
const aws = require('../routes/aws');
const uri = process.env.DBSTRING;

function init(callback)
{
  mongoose.connect(uri, 
  {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    dbName: 'Messenger-decoupled',
  });

  const db = mongoose.connection;

  db.on('error',function (err)
  {
    console.log("Error on connecting to db");
    callback(err);
  });

  db.once('open', function() {
    console.log("Connected to db");
    callback(null);
  });
}

function closeConnection (){
    mongoose.connection.close().then(() => {
        console.log('Mongoose disconnected on app termination');
        process.exit(0);
    }).catch(err => aws.logError(err, 'Database', 'CloseConnection'));
}

module.exports = {
    init: init,
    closeConnection: closeConnection
};