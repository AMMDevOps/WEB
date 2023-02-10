const socket = io('http://localhost:3000');

let active = '';
let socketOk = true;

socket.on('message', (data) => {
    data = JSON.parse(data);
    console.log(data);
});

socket.on('checkback', (data) => {
    data = JSON.parse(data);
    createMSg(data);
    socketOk = true;
});

socket.on('newMsgCb', (data) => {
    data = JSON.parse(data);
    createMSg2(data);
});



socket.on('connect', () => {
    let auth = getauthtoken()
    let sendback = genSendBack(auth)
    socket.emit('connected', sendback);
});

socket.on('history', (data) => {
    let list = JSON.parse(data);
    genHistory(list.list)
    socketOk = true;
});

socket.on('token', (data) => {
    let data = JSON.parse(data)
    console.log("token "+ data);
    if (data.token != 'false') {
        console.log('token ok');
        active = data.token;
        socketOk = true;
    }
});


addEventListener('keydown', (e) => {
    if (e.key == 'Enter') {
        send();
    }
});

let genSendBack = (msg, room) =>{
    let user = getUsername()
    let msgback = JSON.stringify({token: active, msg: msg, room: room, user: user})
    return msgback
}

let getUsername = () =>{
    let list = document.cookie.split(';');
    let txt = '';
    list.forEach(element => {
        if (element.includes('username')) {
            txt += element.split('=')[1];
        }
    });
    return txt
}

let getauthtoken = () =>{
    let list = document.cookie.split(';');
    let txt = '';
    list.forEach(element => {
        if (element.includes('authtoken')) {
            txt += element.split('=')[1];
        }
    });
    return txt;
}


let genHistory = (data) => {
    let username = getUsername();
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

let createMSg2 = (data) => {
    let msg_li = document.createElement('li');
    msg_li.classList.add('user2');
    msg_li.innerHTML = data.msg;
    document.getElementById('messages').appendChild(msg_li);
}

let createMSg = (data) => {
    let msg_li = document.createElement('li');
    msg_li.classList.add('user');
    msg_li.innerHTML = data.msg;
    document.getElementById('messages').appendChild(msg_li);
}

let send = () => {
    if (socketOk == false) {
        return;
    }
    socketOk = false;
    msg = document.getElementById('msg_inp').value;
    document.getElementById('msg_inp').value = '';
    let room = document.getElementById('room').value;
    let sendback = genSendBack(msg, room)
    console.log('sending', sendback);
    socket.emit('message', sendback);
}

let pageUp = () => {
    if (socketOk == false) {
        return;
    }
    socketOk = false;
    let room = document.getElementById('room').value;
    let data = document.getElementById('page').innerHTML;
    data = parseInt(data) - 1;
    document.getElementById('page').innerHTML = data;
    let sendback = genSendBack(data, room)
    socket.emit('page', sendback);
}
