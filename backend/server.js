require('dotenv').config(); // Load .env file

const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser')


const auth = require('./modules/auth');
const functions = require('./modules/functions');
const db = require('./modules/db');
//const arduino = require('./modules/arduino');


app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(cookieSession({
    keys: ['secret1', 'secret2']
}));
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));

//login PAGE
app.get('/', (req, res) => {
    res.render(path.join(__dirname, 'views', 'index.ejs'));
});

//lobby PAGE
app.get('/lobby', auth.check, async(req, res) => {
        res.render(path.join(__dirname, 'views', 'lobby.ejs'), { name: "alma" });
});

//chat PAGE
app.get('/main', auth.check, async(req, res) => {     
        res.render(path.join(__dirname, 'views', 'main.ejs'), { name: "alma" });
});

//sending MSG 
app.post('/msg', auth.check, (req, res) => {
    arduino.send(req.body, req.cookies.username)
    res.redirect('/main');
});

//reg USER
app.post('/register', (req, res) => {
    functions.genUser(req.body);
    res.redirect('/'); 
});

//login USER
app.post('/login', async(req, res) => {
    console.log("-----");
    if(await functions.checkUser(req.body)){
        let authtoken = auth.loginUser(req.body);
        res.cookie('authtoken', authtoken,);
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



app.listen(3000, () => {console.log('Server started on port 3000');});