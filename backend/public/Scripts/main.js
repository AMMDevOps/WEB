const socket = io('http://192.168.1.199:3000');

let active = '';

socket.on('message', (msg) => {
    let message = msg.split(';');
    console.log(message);
});

socket.on('checkback', (mess) => {
    let message = mess.split(';')[0];
    createMSg(message);
});

socket.on('newMsgCb', (msg) => {
    let message = msg.split(';')[0];
    createMSg2(message);
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

let createMSg2 = (msg) => {
    let msg_li = document.createElement('li');
    msg_li.classList.add('user2');
    msg_li.innerHTML = msg;
    document.getElementById('messages').appendChild(msg_li);
}

let createMSg = (msg) => {
    let msg_li = document.createElement('li');
    msg_li.classList.add('user');
    msg_li.innerHTML = msg;
    document.getElementById('messages').appendChild(msg_li);
}

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
    msg += ';';
    msg += room;
    msg += ';';
    msg += username;
    msg += ' ';
    msg += active;
    console.log('sending', msg);
    socket.emit('message', msg);
}
