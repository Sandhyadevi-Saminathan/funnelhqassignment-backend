const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
const URL = process.env.DB;
const secret = process.env.SECRET;
const password = process.env.password;
const rn = require('random-number');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');


const authorize = (req, res, next) => {
    if (req.headers.authorization) {
        try {
            const token = req.headers.authorization.replace('Bearer ', '');
            const decoded = jwt.verify(token, secret);
            console.log(decoded)
            const currentTime = Math.floor(Date.now() / 1000); 
            if (decoded.exp < currentTime) {
                res.json({ message: "Token expired" });
            } else {
                next(); 
            }
        } catch (error) {
            res.status(401).json({ message: "Token expired" });
        }
    } else {
        res.status(401).json({ message: "Unauthorized2" });
    }
}

//for registration
router.post('/register', async (req, res) => {
   
    try {
        console.log(req.body)
        let connection = await mongoClient.connect(URL);
        let db = connection.db('user');
        const collection = db.collection("register")
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(req.body.password, salt);
        req.body.password = hash;

        const operations = await collection.insertOne({ ...req.body, isDeleted: false })
        await connection.close();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error registering user" });
    }

})

//for login
router.post('/login', async (req, res) => {
   
    try {
       
        let connection = await mongoClient.connect(URL);
        let db = connection.db('user');
        const collection = db.collection("register");
        const user = await collection.findOne({ email: req.body.email });

        if (user) {
            let passwordResult = await bcrypt.compare(req.body.password, user.password);
            if (passwordResult) {
                const token = jwt.sign({ userid: user._id }, secret, { expiresIn: '30s' })
              
                res.json({ message: "Login Success", token, user })

            }
            else {
                res.json({ message: "Email id or password do not match" })

            }
        } else {
            res.json({ message: "Email id or password do not match" })

        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error during login" });
    }
})

//for profile
router.get('/user/:id', authorize, async (req, res) => {


    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db('user');
        let objId = new mongodb.ObjectId(req.params.id)
        let users = await db.collection("register").findOne({ _id: objId });
        res.json(users);
        await connection.close()
    } catch (error) {
        console.log('User Not Found')
        console.log(req.params.id)
        console.log(error)
    }
})


//Refresh Token

router.post('/refresh-token', async (req, res) => {
    const id = req.body.id;
   

    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db('user');
        let objId = new mongodb.ObjectId(id)
        let users = await db.collection("register").findOne({ _id: objId });

        const accessToken = jwt.sign({ id: users._id }, secret, { expiresIn: '30s' })
              
        
        // Generate a new access token using the extracted user ID
        

        // Send the new access token to the client
        res.json({ accessToken });
    } catch (error) {
        console.error(error);
        res.status(401).json({ error: 'Invalid refresh token' });
    }
});


module.exports = router;