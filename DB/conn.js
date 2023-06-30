const mongoose = require('mongoose');
const DB = process.env.DATABASE;
// const DB='mongodb://127.0.0.1:27017/venudb'
console.log(DB);
mongoose.connect(DB).then(() => {
    console.log("connection successful")
}).catch((err) => { console.log(err, "not connected"); })

