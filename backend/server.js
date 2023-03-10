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
    socket.on('connected', async(data) => {
        
        data = JSON.parse(data)
        let username = data.user;
        let token = await auth.startSocketValidating(data, socket.id);

        if (token != false){
            functions.setSocket(username, socket.id);

            let sendback = JSON.stringify({token: token})
            socket.emit('token', sendback);
        } else {
            socket.emit('token', 'false');
        }
    });

    socket.on('page', async(data) => {

        data = JSON.parse(data)
        let token = await auth.checkStoken(data);

        if (token != false){
            let sendback = JSON.stringify({token: token})
            socket.emit('token', sendback);

            let prev_page = await functions.getChatPage(data);

            formated_page = JSON.stringify({list: prev_page});
            socket.emit('history', formated_page);
        }
    });

    socket.on('message', async(data) => {
        
        data = JSON.parse(data)
        let token = await auth.checkStoken(data);
        let senderid = await functions.getSecSocketID(data);

        if (token != false){

            let sendback = JSON.stringify({token: token})
            socket.emit('token', sendback);

            functions.sendMsg(data);
            io.to(senderid).emit('newMsgCb', data);            
            socket.emit('checkback', data);
        }
    });

});


const auth = require('./modules/auth');
const functions = require('./modules/functions');
const db = require('./modules/db');
const arduino = require('./modules/arduino');


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
    if (functions.genUser(req.body)) {
        res.redirect('/'); 
    } else {
        res.redirect('/userAlreadyExists');
    }
});

//login USER
app.post('/login', async(req, res) => {
    if(await functions.checkUser(req.body)){
        res.clearCookie("authtoken");
        res.clearCookie("username");
        res.clearCookie("sockettoken");

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

//logout USER
app.post('/logout', auth.check, (req, res) => {
    let sql = `UPDATE users SET auth = 0 WHERE username = '${req.body.username}'`;
    db.pls(sql);
    res.redirect("/");
});


app.post('/addFriend', auth.check, async(req, res) => {
    functions.addFriend(req.body.name, req.cookies.username);
    res.redirect('/lobby');
});



//GET GET GET ---------------------------------------------------------------

//login PAGE
app.get('/', (req, res) => {
    res.render(path.join(__dirname, 'views', 'index.ejs'));
});

//lobby PAGE
app.get('/lobby', auth.check, async(req, res) => {

    let user_rooms = await functions.getRooms(req.cookies.username);
    let pot_friends = await functions.getPotFriends(req.cookies.username);

    res.render(path.join(__dirname, 'views', 'lobby.ejs'), { rooms: user_rooms, pot_friends: pot_friends});
});

//chat PAGE
app.get('/chat', auth.check, async(req, res) => { 

    let room_id = parseInt(req.query.id);
    let chat = await functions.getChat(room_id);
    let room_page = 1;

    if (chat.length > 0) room_page = chat[0].page;

    let user_rooms = await functions.getRooms(req.cookies.username);
    let room_mate = await functions.getRoomMate(room_id, req.cookies.username);

    res.render(path.join(__dirname, 'views', 'chat.ejs'), { name: room_mate, messages: chat, room: room_id, page: room_page, rooms: user_rooms });
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