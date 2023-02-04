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
    const reftoken = genRef(user)

    let sql = `UPDATE users SET auth = '${reftoken}' WHERE username = '${username}'`;
    db.pls(sql)

    return accestoken;
}

async function findRef(name) {
        let sql = `SELECT auth FROM users WHERE username = '${name}'`;
        let resu = await db.pls(sql)
        let reftoken = resu.rows[0].auth;
        let data = testRef(reftoken);
        return data;
            
}

function testRef(token) {
    let data = {}
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }
        let accestoken = genToken({name: user.name});
        data = {authtoken: accestoken, user: user.name};
    })
    return data     
}


function check (req, res, next) {
    let token = req.cookies.authtoken;

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async(err, user) => {
        if (err) {
            const payload = jwt.decode(token);
            let uname = payload.name.replaceAll(' ','')
            let data = await findRef(uname);
            if (data == null) {return res.sendStatus(403);}
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