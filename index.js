const express = require("express");
const app = express();
const cors = require("cors");
const passport= require("passport")
const session = require('express-session');
const passportSetup= require("./passport")

const dotenv = require("dotenv").config();
app.use(express.json());

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize())
app.use(passport.session())
app.use(cors({ origin: 'https://master--glistening-taffy-543cfb.netlify.app', credentials: true }));

   
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/auth');


app.use('/users', userRoutes);
app.use('/auth', authRoutes);

app.listen(process.env.PORT || 8000);