require('dotenv').config(); // Load .env file

const express = require('express');
const app = express();
const path = require('path');
const jwt = require('jsonwebtoken');

const functions = require('./modules/functions');
const db = require('./modules/db');
const arduino = require('./modules/arduino');


app.set('view engine', 'ejs');


app.use(express.urlencoded({ extended: false }));
app.use(express.json());



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
    arduino.send(req.body, serialport, req.cookies.username)
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

app.listen(3000, () => {console.log('Server started on port 3000');});