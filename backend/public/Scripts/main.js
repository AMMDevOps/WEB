const socket = io('http://localhost:3000');

let active = '';
let socketOk = true;

socket.on('message', (msg) => {
    let message = msg.split(';');
    console.log(message);
});

socket.on('checkback', (mess) => {
    let message = mess.split(';')[0];
    createMSg(message);
    socketOk = true;
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

socket.on('history', (data) => {
    let list = JSON.parse(data);
    console.log(list);
    list.list.forEach(element => {
        let message = element.split(';')[0];
        createMSg2(message);
    });
    socketOk = true;
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
    if (socketOk == false) {
        return;
    }
    socketOk = false;
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

let pageUp = () => {
    if (socketOk == false) {
        return;
    }
    socketOk = false;
    let cookie = document.cookie.split(';');
    let username = '';
    cookie.forEach(c => {
        if (c.includes('username')) {
            username = c.split('=')[1];
        }
    });
    let room = document.getElementById('room').value;
    let page = document.getElementById('page').innerHTML;
    page += ';';
    page += room;
    page += ';';
    page += username;
    page += ' ';
    page += active;
    document.getElementById('page').innerHTML = page;

    socket.emit('page', page);
}
