const socket = io('http://localhost:3000');

let active = '';

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
    console.log("token", JSON.parse(data));
    console.log("alma", data);
    if (data != 'false') {
        active = data.token;
        console.log(active);
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
    console.log(active);
    msg += active;
    console.log(msg);
    socket.emit('message', msg);
}