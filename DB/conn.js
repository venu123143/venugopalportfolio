const mongoose = require('mongoose');
const DB= process.env.DATABASE;
// const db='mongodb://127.0.0.1:27017/venudb'

mongoose.connect(DB).then(() => {
    console.log("connection successful")
}).catch((err) => { console.log(err,"not connected"); })

