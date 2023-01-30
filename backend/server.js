const express = require('express');
const app = express();
const http = require('http').Server(app);
const path = require('path');
const session = require('express-session');
const cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser')


const functions = require('./modules/functions');


const io = require('socket.io')(http);

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });
});


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



http.listen(3000, () => {console.log('Server started on port 3000');});