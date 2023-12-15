const GoogleStrategy = require("passport-google-oauth20").Strategy
const passport=require("passport")

const dotenv = require("dotenv").config();

passport.use(
    new GoogleStrategy(
        {
            clientID:process.env.ID,
            clientSecret:process.env.CLIENT_SECRET,
            callbackURL:process.env.callbackURL,
            passReqToCallback:true,
            scope:["profile","email"],

        },
        function(request,accessToken,refreshToken,profile,callback)
        {
         return callback(null,profile);
        }
    )
);
passport.serializeUser((user,done)=>{
    done(null,user);
});
passport.deserializeUser((user,done)=>{
    done(null,user);
});