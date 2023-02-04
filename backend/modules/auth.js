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

function findRef(name) {
        console.log("findRefname: ", name);
        let sql = `SELECT * FROM users WHERE username = '${name}'`;
        db.pls(sql, (err, result) => {
            if (err) {
                console.log("alma");
                return res.sendStatus(403);
            }
            let user = result.rows;
            let reftoken = user.auth;
            console.log("findRefreftoken: ", reftoken);
            let data = testRef(reftoken);
            console.log("findRefdata: ", data);
            return data;
            
        });
}

function testRef(token) {
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) {
            console.log("testReferr: ", err);
            return res.sendStatus(403);
        }
        let accestoken = genToken(user);
        let reftoken = genRef(user);
        let sql = `UPDATE users SET auth = '${reftoken}' WHERE username = '${user.name}'`;
        db.pls(sql);
        console.log("testRefdata: ", {authtoken: accestoken, user: user.name});
        return {authtoken: accestoken, user: user.name};
    })     
}


function check (req, res, next) {
    let token = req.cookies.authtoken;

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async(err, user) => {
        if (err) {
            const payload = jwt.decode(token);
            let data = await findRef(payload.name.replaceAll(' ',''));
            console.log("new token: ", data);
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