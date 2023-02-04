require('dotenv').config();

// import modules
const db = require('./db');
const jwt = require('jsonwebtoken');


// Generate token for user
function genToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10m' });
}

// Generate refresh token for user
function genRef(user) {
    return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '10min' });
}


// Login user and assign token for them
function loginUser(data) {
    //username = from the form data
    const username = data.username;
    //fromating the user data for the token
    const user = { name: username };

    //generating the token
    const accestoken = genToken(user);
    const reftoken = genRef(user)

    //updating the database with the refresh token
    let sql = `UPDATE users SET auth = '${reftoken}' WHERE username = '${username}'`;
    db.pls(sql)

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

        //if the token is not valid, check if the refresh token is valid
        if (err) {
            //getting the data from the old expired token
            const payload = jwt.decode(token);
            //getting the username from the data
            let uname = payload.name.replaceAll(' ','')
            //getting a new token if the refresh token is valid
            let data = await findRef(uname);
            //if there is no data, return 403
            if (data == null) {return res.sendStatus(403);}

            //if there is data, set the new token and continue
            res.cookie('authtoken', data.authtoken);
            req.user = data.user;
            next();
        }
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

// finding the refresh token in the database
async function findRef(name) {
        //name is the username from the old token
        let sql = `SELECT auth FROM users WHERE username = '${name}'`;
        //getting the ref token from the database
        let resu = await db.pls(sql);   
        let reftoken = resu.rows[0].auth;

        //testing the ref token for validity
        let data = testRef(reftoken);
        return data;
            
}

// testing the ref token for validity and generating a new authToken
function testRef(token) {
    //for formatting the data
    let data = {}

    //testing the ref token
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) {
            //if the ref token is not valid, return 403
            return res.sendStatus(403);
        }

        //if the ref token is valid, generate a new authToken
        let accestoken = genToken({name: user.name});
        data = {authtoken: accestoken, user: user.name};

        //generating a new ref token
        let reftoken = genRef({name: user.name});
        let sql = `UPDATE users SET auth = '${reftoken}' WHERE username = '${user.name}'`;
        db.pls(sql)
    })
    //return the new authToken
    return data     
}




module.exports = {
    check,
    loginUser
}