require('dotenv').config();

const db = require('./db');
const jwt = require('jsonwebtoken');

function genToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10s' });
}


function loginUser(data) {
    const username = data.username;
    const user = { name: username };

    const accestoken = genToken(user);
    
    const reftoken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
    let sql = `UPDATE users SET auth = '${reftoken}' WHERE username = '${username}'`;
    db.pls(sql)

    return accestoken;
}


function check(req, res, next) {
    let token = req.cookies.authtoken;

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            console.log("user", user);
            console.log(err);
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
}

module.exports = {
    check,
    loginUser
}