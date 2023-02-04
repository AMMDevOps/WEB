require('dotenv').config();

const db = require('./db');
const jwt = require('jsonwebtoken');

function genToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10s' });
}

function genRef(user) {
    return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '20min' });
}


function loginUser(data) {
    const username = data.username;
    const user = { name: username };

    const accestoken = genToken(user);
    
    const reftoken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10s' });
    let sql = `UPDATE users SET auth = '${reftoken}' WHERE username = '${username}'`;
    db.pls(sql)

    return accestoken;
}

function findRef(token) {
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log(payload);
        let sql = `SELECT * FROM users WHERE username = '${payload.name}'`;
        db.pls(sql, (err, result) => {
            if (err) {
                return res.sendStatus(403);
            }
            if (result.rows.length > 0) {
                let user = result.rows[0];
                let reftoken = user.auth;
                let data = testRef(reftoken);
                return data;
            }
        });
}

function testRef(token) {
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }
        let accestoken = genToken(user);
        let reftoken = genRef(user);
        let sql = `UPDATE users SET auth = '${reftoken}' WHERE username = '${user.name}'`;
        db.pls(sql);
        return {authtoken: accestoken, user: user.name};
    })     
}


function check(req, res, next) {
    let token = req.cookies.authtoken;

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log(payload);
        if (err) {

            let data = findRef(payload);
            if (data == null) {
                return res.sendStatus(403);
            }
            res.cookie('authtoken', data.authtoken);
            req.user = data.user;
            next();
        }
        req.user = user;
        next();
    });
}

module.exports = {
    check,
    loginUser
}