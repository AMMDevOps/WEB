const socket = io('http://localhost:3000');

socket.on('connect', () => {
    console.log(document.cookie.split(';'));
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
    console.log(txt);
    socket.emit('connected', txt);
});

socket.on('token', (data) => {
    if (data != 'false') {
        document.cookie = `sockettoken=${data}`;
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
    let token = findStoken();
    msg += token;
    console.log(msg);
    socket.emit('message', msg);
}

let findStoken = () => {
    let list = document.cookie.split(';');
    let txt = '';
    list.forEach(element => {
        if (element.includes('sockettoken')) {
            txt += element.split('=')[1];
        }
    });
    return txt;
}