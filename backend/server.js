require('dotenv').config(); // Load .env file

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const path = require('path');
const session = require('express-session');
const cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser')
const io = require('socket.io')(http, {cors: {origin: '*',}});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('connected', (data) => {
        let username = data.split(' ')[0];
        let token = auth.checkSocket(data);
        if (token != false){
            functions.setSocket(username, socket.id);
            socket.emit('token', token);
        } else {
            socket.emit('token', 'false');
        }
    });
});




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

//MAIN POST POST POST POST POST ----------------------------------------------

//register USER
app.post('/register', (req, res) => {
    functions.genUser(req.body);
    res.redirect('/'); 
});

//login USER
app.post('/login', async(req, res) => {
    if(await functions.checkUser(req.body)){
        console.log("----------------------");
        let authtoken = auth.loginUser(req.body);
        res.cookie('authtoken', authtoken,);
        res.cookie('username', req.body.username);
        res.redirect(`/lobby`);
    } else {
        res.redirect('/');
    }
});

app.post('/join', auth.check, (req, res) => {
    res.redirect(`/chat/?id=${req.body.room}`);
    
});

let genRoom =

//logout USER
app.post('/logout', auth.check, (req, res) => {
    let sql = `UPDATE users SET auth = '' WHERE username = '${req.body.username}'`;
    db.pls(sql);
    res.redirect("/");
});

//send MSG
app.post('/msg', auth.check, (req, res) => {
    functions.sendMsg(req.body, req.cookies.username);
    res.redirect(`/chat/?id=${req.body.room}`);
});



//GET GET GET ---------------------------------------------------------------

//login PAGE
app.get('/', (req, res) => {
    res.render(path.join(__dirname, 'views', 'index.ejs'));
});

//lobby PAGE
app.get('/lobby', auth.check, async(req, res) => {
    let user_rooms = await functions.getRooms(req.cookies.username);
    res.render(path.join(__dirname, 'views', 'lobby.ejs'), { rooms: user_rooms });
});

//chat PAGE
app.get('/chat', auth.check, async(req, res) => { 
    let room_id = parseInt(req.query.id);
    let chat = await functions.getChat(room_id);
    let room_mate = await functions.getRoomMate(room_id, req.cookies.username);
    res.render(path.join(__dirname, 'views', 'chat.ejs'), { name: room_mate, messages: chat, room: room_id,});
});


//messing with arduino ---------------------------------------------------------------

//sending MSG 
app.post('/msgArduino', auth.check, (req, res) => {
    arduino.send(req.body, req.cookies.username)
    res.redirect('/main');
});


http.listen(3000, () => {
    console.log('listening on 3000');
});