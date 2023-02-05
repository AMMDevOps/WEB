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
    socket.emit('connected', txt);
});

socket.on('token', (data) => {
    if (data != 'false') {
        document.cookie = ` authtoken=${data}`;
    }
});
