const socket = io('http://192.168.1.199:8080');

socket.on('connect', () => {
    console.log('connected');
});

socket.on('message', (msg) => {
    console.log(msg);
});