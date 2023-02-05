const http = require('http').createServer();

const io = require('socket.io')(http, {
    cors: {
        origin: '*',
    }
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    socket.on('msg', (msg) => {
        console.log('message: ' + msg);
    });
});

http.listen(8080, () => {
    console.log('listening on *:3000');
});