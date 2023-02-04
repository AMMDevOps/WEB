require('dotenv').config();

// import modules
const db = require('./db');
const jwt = require('jsonwebtoken');


// Generate token for user
function genToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '5m' });
}


// Login user and assign token for them
function loginUser(data) {
    //username = from the form data
    const username = data.username;
    //fromating the user data for the token
    const user = { name: username };

    //generating the token
    const accestoken = genToken(user);

    //returning the token
    return accestoken;
}

// Check if the user is authorized
function check (req, res, next) {

    //getting the token from the cookies
    let token = req.cookies.authtoken;

    //if there is no token, return 401
    if (token == null) return res.sendStatus(401);

    //if there is a token, check if it is valid
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async(err, user) => {
        if (err) {console.log(err); return res.sendStatus(403);}
        //if the token is valid, continue
        
        //generating a new token
        let accestoken = genToken({name: req.cookies.username});
        //setting the new token
        res.cookie('authtoken', accestoken);

        //setting the user and continuing
        req.user = user;
        next();
    });
}

module.exports = {
    check,
    loginUser
}