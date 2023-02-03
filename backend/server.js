require('dotenv').config(); // Load .env file

const express = require('express');
const app = express();
const path = require('path');
const jwt = require('jsonwebtoken');

const functions = require('./modules/functions');
const db = require('./modules/db');
const arduino = require('./modules/arduino');


app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());



//login PAGE
app.get('/', (req, res) => {
    res.render(path.join(__dirname, 'views', 'index.ejs'));
});

//lobby PAGE
app.get('/lobby', functions.authToken, async(req, res) => {
        res.render(path.join(__dirname, 'views', 'lobby.ejs'), { name: "alma" });
});

//chat PAGE
app.get('/main', functions.authToken, async(req, res) => {     
        res.render(path.join(__dirname, 'views', 'main.ejs'), { name: "alma" });
});





//sending MSG 
app.post('/msg', functions.authToken, (req, res) => {
    arduino.send(req.body, serialport, req.cookies.username)
    res.redirect('/main');
});

//reg USER
app.post('/register', (req, res) => {
    functions.genUser(req.body, client);
    res.redirect('/'); 
});

//login USER
app.post('/login', async(req, res) => {
    console.log(req.body);
    if(await functions.checkUser(req.body)){
        const username = req.body.username;
        const user = { name: username };

        const accestoken = genAuthToken(user);
        const reftoken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
        

        let sql = `UPDATE users SET auth = '${reftoken}' WHERE username = '${username}'`;
        db.pls(sql)
        console.log("alma");
        res.redirect(`/main`);
    } else {
        res.redirect('/');
    }
});

//logout USER
app.delete('/logout', (req, res) => {
    console.log('logout');
    let sql = `UPDATE users SET auth = '' WHERE username = '${req.body.username}'`;
    db.pls(sql);
    res.sendStatus(204);
    res.redirect('/');
});


//refresh TOKEN
app.post('/token', (req, res) => {
    const refreshToken = req.body.token;
    if (refreshToken == null) return res.sendStatus(401);
    let sql = `SELECT * FROM users WHERE auth = '${refreshToken}'`;
    data = db.pls(sql);
    if (data.rows.length == 0) return res.sendStatus(403);
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        const accessToken = genAuthToken({ name: user.name });
        res.json({ accessToken: accessToken });
    }); 
});

//GENERATE TOKEN
function genAuthToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10m' });
}

app.listen(3000, () => {console.log('Server started on port 3000');});