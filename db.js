const mongoose = require('mongoose');
const URI = process.env.DB;

const connectToMongo = ()=>{
    mongoose.connect(URI);
    mongoose.connection.once('open',()=>{
        console.log("Connected to mongo")
    });
    mongoose.connection.on("error",()=>{
        console.log("error to Connect to db")
        process.exit();
    })
}

module.exports = connectToMongo;