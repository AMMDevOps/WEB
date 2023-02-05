const socket = io('http://192.168.1.199:3000');

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
    let msg = document.getElementById('msg_inp').value;
    document.getElementById('msg_inp').value = '';
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