require('dotenv').config();

// import modules
const db = require('./db');
const jwt = require('jsonwebtoken');


// Generate token for user
function genToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '5m' });
}

// Start validity of the token
async function startValidity(user) {
    let sql = `UPDATE users SET auth = ${user.valid} WHERE username = '${user.name}'`;
    db.pls(sql);
}

// Update the validity of the token
async function newId(user) {
    let sql = `UPDATE users SET auth = ${user.valid + 1} WHERE username = '${user.name}'`;
    db.pls(sql);
}

async function newSocketSave(user) {
    let sql = `UPDATE users SET socketid = '${user.socket}' WHERE username = '${user.name}'`;
    db.pls(sql);
}

// Check if the token is valid
async function validityCheck(user) {
    if (user != null) {
    let sql = `SELECT auth FROM users WHERE username = '${user.name}'`;
    //data will be the id of the token thats in auth
    data = await db.pls(sql);
    if (data.rows[0].auth == user.valid) {
        return true;
    } else {
        return false;
    }
    } else {
        return false;
    }
    
}

async function validStoken(user) {
    let sql = `SELECT * FROM users WHERE username = '${user.name}'`;
    let data = await db.pls(sql);

    if (data.rows[0].socketid == user.socket){
        return true;
    }
    else{
        return false;
    }
}

// Login user and assign token for them
function loginUser(data) {
    //username = from the form data
    const username = data.username;
    //fromating the user data for the token
    const user = { name: username, valid: 0};

    //generating the token
    const accestoken = genToken(user);

    //starting the validity of the token
    startValidity(user);

    //returning the token
    return accestoken;
}

async function checkStoken(data) {
    let token = data.split(' ')[0];

    let newtoken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async(err, user) => {
        if (err){console.log(err);return false;}

        let stat = await validStoken(user)

        if (stat){
            //generating a new Socket_token
            let socket_token = genToken({name: user.name, socket: user.socket});
            
            newSocketSave(user);
            //setting the new token
            return socket_token;
        } else {
            return false;
        }
    })
    return newtoken;
}



function startSocketValidating(data, sockid) {
    let list = data.split(' ');
    let token = list[0];

    let auth = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async(err, user) => {
        if (err) {console.log(err); return false;}
        //if the token is valid, continue
        
        //checking if the token is in the order of validity
        console.log(user);
        let stat = await validityCheck(user);
        if (stat){
            //generating a new Socket_token
            let socket_token = genToken({name: user.name, socket: sockid});
            //setting the new token
            return socket_token;
        } else {
            return false;
        }
    }
    );
    return auth;
};

// Check if the user is authorized
function check (req, res, next) {
    //getting the token from the cookies
    let token = req.cookies.authtoken;
    let s_token = req.cookies.socketauthtoken;
    //if there is no token, return 401
    if (token == null) return res.sendStatus(401);

    //if there is a token, check if it is valid
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async(err, user) => {
        if (err) {
            jwt.verify(s_token, process.env.ACCESS_TOKEN_SECRET, async(err, suser) => {
                if (err) {
                    console.log(err);
                    return res.sendStatus(403);
                }
                //if the token is valid, continue

                let stat = await validityCheck(suser);
                if (stat){
                    newId(suser);
                    //generating a new token
                    let accestoken = genToken({name: suser.name, valid: suser.valid + 1});
                    //setting the new token
                    res.cookie('authtoken', accestoken);
                    //setting the user and continuing
                    req.user = suser;
                    next();
                }
            console.log(err);
            return res.sendStatus(403);
            });
        }
        //if the token is valid, continue
        
        //checking if the token is in the order of validity
        let stat = await validityCheck(user);
        if (stat){
            newId(user);
            //generating a new token
            let accestoken = genToken({name: user.name, valid: user.valid + 1});
            //setting the new token
            res.cookie('authtoken', accestoken);
            //setting the user and continuing
            req.user = user;
            next();
        } 
    });
}

module.exports = {
    checkStoken,
    startSocketValidating,
    check,
    loginUser
}