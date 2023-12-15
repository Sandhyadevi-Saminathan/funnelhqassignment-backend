const express = require('express');
const dotenv = require("dotenv").config();
const passport= require("passport");
const router = require('./userRoutes');
const URL = process.env.DB;
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET;
const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;


router.get("/login/failed",(req,res)=>{
    res.status(403).json({
        error:true,
        message:"Log in failure"
    })
})


router.get(
  "/google/callback",
  passport.authenticate("google", {
   
    successRedirect: "/auth/token/generate",
    failureRedirect: "/auth/login/failed"
  })
);

router.get("/token/generate", async (req, res) => {
  try {
    const profile = req.user;

    let connection = await mongoClient.connect(URL);
    let db = connection.db('user');
    const collection = db.collection("register");

    const existingUser = await collection.findOne({ googleId: profile.id });
    let objId;
    if (existingUser) {
      objId = existingUser._id;
      const updatedUser = {
        name: profile.displayName,
        email: profile.emails[0].value,
      };
      await collection.updateOne({ googleId: profile.id }, { $set: updatedUser });
      await connection.close();
    } else {
      // User doesn't exist, create a new user record
      const newUser = {
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        
      };

      const result = await collection.insertOne(newUser);
      objId = result.insertedId; 
      await connection.close();
    }

    // Generate a token
    const token = jwt.sign({ userId: profile.id }, secretKey,{ expiresIn: '300s' });
    
    // Send the token in the JSON response
    const redirectURL = `${process.env.CLIENT_URL}?token=${token}&userId=${objId}`;
    res.redirect(redirectURL);
    
   
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error handling Google authentication" });
  }
});


router.get("/google",passport.authenticate("google",{scope:["profile","email"]}))


module.exports=router