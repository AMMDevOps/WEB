const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser')

const functions = require('./modules/functions');

const { SerialPort } = require('serialport')


const serialport = new SerialPort({ path: 'COM3', baudRate: 9600 });
serialport.on('open', () => {
    console.log('Serial port open')
    let data = new Buffer.from("A")
    console.log(data);
    serialport.write(data)
    
});
serialport.write('A', function(err) {
    if (err) {
      return console.log('Error on write: ', err.message)
    }
    console.log('sent')
});

serialport.on('data', (data) => {
    console.log('Data: ', data);
    serialport.write('Alma');
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

app.get('/main', async(req, res) => {
    let data = await functions.checkAuth(req.cookies, client);
    if (data.status == true) {      
        res.render(path.join(__dirname, 'views', 'main.ejs'), { name: req.cookies.username });
    }
    else {
        res.redirect('/');
    }
});

app.post('/lamp', (req, res) => {
    functions.lamp(req.body);
    res.redirect('/main');
});

app.post('/logout', (req, res) => {
    console.log('logout');
    res.clearCookie('auth');
    res.clearCookie('username');
    res.redirect('/');
});

app.post('/login', async(req, res) => {
    let ui = await functions.checkUser(req.body, client)
    if(ui.status == true){
        res.cookie('auth', ui.data.auth);
        res.cookie('username', req.body.username);
        res.redirect(`/main`);
    } else {
        res.redirect('/');
    }
});

app.post('/register', (req, res) => {
    functions.genUser(req.body, client);
    res.redirect('/'); 
});



app.listen(3000, () => {console.log('Server started on port 3000');});