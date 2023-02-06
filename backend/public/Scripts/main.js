const socket = io('http://localhost:3000');

let active = '';

socket.on('message', (msg) => {
    let message = msg.split(';');
    console.log(message);
});

socket.on('connect', () => {
    let list = document.cookie.split(';');
    let txt = '';
    list.forEach(element => {
        if (element.includes('username')) {
            txt += element.split('=')[1];
            txt += ' ';
        }
        if (element.includes('authtoken')) {
            txt += element.split('=')[1];
        }
    });
    socket.emit('connected', txt);
});

socket.on('token', (data) => {
    console.log(data);

    if (data != 'false') {
        active = data;
    }
});


addEventListener('keydown', (e) => {
    if (e.key == 'Enter') {
        send();
    }
});

let send = () => {
    let cookie = document.cookie.split(';');
    let username = '';
    cookie.forEach(c => {
        if (c.includes('username')) {
            username = c.split('=')[1];
        }
    });
    let msg = document.getElementById('msg_inp').value;
    document.getElementById('msg_inp').value = '';
    let room = document.getElementById('room').value;
    document.getElementById('room').value = '';
    msg += ';';
    msg += room;
    msg += ';';
    msg += username;
    msg += ' ';
    msg += active;
    socket.emit('message', msg);
}

setInterval(() => {
    console.log('sending', active);
}, 300);