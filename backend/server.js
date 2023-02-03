require('dotenv').config(); // Load .env file

const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken');

const functions = require('./modules/functions');



const { SerialPort } = require('serialport')
const serialport = new SerialPort({ path: 'COM3', baudRate: 9600 });
let msg = '';
serialport.on('open', () => {
    console.log('Serial port open');

});

serialport.on('data', (data) => {
    for (let i = 0; i < data.length; i++) {
        if (data.toString()[i] == "\n") {
            console.log('Message: ', msg);
            msg = '';
        } else {
            msg += String.fromCharCode(data[i]);
        }
    }
});



const { Client } = require('pg');
const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'amm',
    user: 'postgres',
    password: 'admin'
});
client.connect();


app.set('view engine', 'ejs');


app.use(express.json())
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieSession({
    keys: ['secret1', 'secret2']
}));
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));


app.get('/', (req, res) => {
    res.render(path.join(__dirname, 'views', 'index.ejs'));
});

app.get('/js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Scripts', 'main.js'));
});

app.get('lobby', authToken, async(req, res) => {
    let data = await functions.checkAuth(req.cookies, client);
    if (data.status == true) {
        res.render(path.join(__dirname, 'views', 'lobby.ejs'), { name: req.cookies.username });
    }
    else {
        res.redirect('/');
    }
});

app.get('/main',authToken, async(req, res) => {
    let data = await functions.checkAuth(req.cookies, client);
    if (data.status == true) {      
        res.render(path.join(__dirname, 'views', 'main.ejs'), { name: req.cookies.username });
    }
    else {
        res.redirect('/');
    }
});

app.post('/msg', (req, res) => {
    functions.msg(req.body, serialport, req.cookies.username);
    res.redirect('/main');
});

app.post('/logout', (req, res) => {
    console.log('logout');
    res.clearCookie('auth');
    res.clearCookie('username');
    res.redirect('/');
});



app.post('/register', (req, res) => {
    functions.genUser(req.body, client);
    res.redirect('/'); 
});


function authToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

app.listen(3000, () => {console.log('Server started on port 3000');});