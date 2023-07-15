const mongoose = require('mongoose');

const MANGODB_URL = "mongodb://0.0.0.0/my_database"

const databaseConnect = () => {

   mongoose
      .connect(MANGODB_URL) 
      .then( (conn) =>{
        console.log(`Connected to ${conn.connection.host}`)
      })
     .catch((e) => console.log(e.message))
}

module.exports = databaseConnect