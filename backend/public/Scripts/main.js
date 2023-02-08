const socket = io('http://192.168.1.199:3000');

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
    genHistory(list.list)
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

let genHistory = (data) => {
    let cookies = document.cookie.split(';');
    let username = '';
    cookies.forEach(c => {
        if (c.includes('username')) {
            username = c.split('=')[1];
        }
    });
    let page = document.createElement('div');
    for (let i = 0; i < data.length; i++) {
        let element = document.createElement('div');
        element.innerHTML = data[i].message;
        if (data[i].user == username) {
            element.classList.add('user');
        } else {
            element.classList.add('user2');
        }
        page.appendChild(element);
    }
    let history = document.getElementById('history_msg');
    let save = history.innerHTML;
    history.innerHTML = page.innerHTML;
    history.innerHTML += save;
}

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
    page = parseInt(page) - 1;
    document.getElementById('page').innerHTML = page;
    page += ';';
    page += room;
    page += ';';
    page += username;
    page += ' ';
    page += active;

    socket.emit('page', page);
}
