const cookieParser = require("cookie-parser");
// const mongoose = require('mongoose');
const express = require('express');
const dotenv = require('dotenv');

const app = express();

// const User = require("./model/User")
app.use(cookieParser())
const cors = require('cors')

const corsOptions = {
    origin: ['http://localhost:3000','https://venugopalportfolioweb.onrender.com'],
    credentials: true,  
    withCredentials:true,
    optionSuccessStatus: 200,
}

// to communicate with another ports for security reasons 
app.use(cors(corsOptions))
app.use(express.json());
// config env files(for loose coupling)
dotenv.config({ path: './config.env' })
const PORT = process.env.PORT || 5000;


// use json coz, post or get method doesn't know that we are passing object in json format
app.use(require('./route/auth')) 

// if(process.env.NODE_ENV==="production"){
//     app.use(express.static("frontend/build"));
// }
app.listen(PORT, () => {
    console.log(`server is running at port number ${PORT}`);
})