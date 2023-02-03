require('dotenv').config(); // Load .env file

const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const pg = require('pg');

const { Client } = require('pg');
const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'amm',
    user: 'postgres',
    password: 'admin'
});
client.connect();

app.use(express.json())

app.delete('/logout', (req, res) => {
    console.log('logout');
    res.clearCookie('auth');
    res.clearCookie('username');
    let sql = `UPDATE users SET auth = '' WHERE username = '${req.body.username}'`;
    client.query(sql)
    res.sendStatus(204);
    res.redirect('/');
});

app.post('/token', (req, res) => {
    const refreshToken = req.body.token;
    if (refreshToken == null) return res.sendStatus(401);
    let sql = `SELECT * FROM users WHERE auth = '${refreshToken}'`;
    data = client.query(sql)
    if (data.rows.length == 0) return res.sendStatus(403);
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        const accessToken = genAuthToken({ name: user.name });
        res.json({ accessToken: accessToken });
    }); 
});

app.post('/login', async(req, res) => {
    let data = await functions.genUser(req.body, client);
    let ui = await functions.checkUser(req.body, client)
    if(ui.status == true){
        const username = req.body.username;
        const user = { name: username };

        const accestoken = genAuthToken(user);
        const reftoken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
        res.json({ accesToken: accestoken , refreshToken: reftoken})

        let sql = `UPDATE users SET auth = '${authkey}' WHERE username = '${username}'`;
        client.query(sql)

        res.cookie('auth', ui.data.auth);
        res.cookie('username', req.body.username);
        res.redirect(`/lobby`);
    } else {
        res.redirect('/');
    }
});

function genAuthToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10m' });
}



app.listen(4000, () => {console.log('authServer started on port 4000');});