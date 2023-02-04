const { SerialPort } = require('serialport')
const serialport = new SerialPort({ path: 'COM3', baudRate: 9600 });
let msg = '';
serialport.on('open', () => {
    console.log('Serial port open');

});

serialport.on('data', (data) => {
    for (let i = 0; i < data.length; i++) {
        if (data.toString()[i] == "\n") {
            console.log('Message: ', msg);
            msg = '';
        } else {
            msg += String.fromCharCode(data[i]);
        }
    }
});

let send = (data, name) => {
    let message = data.msg;
    console.log(message, name);
    serialport.write(`${message}\n${name}`);
}

module.exports = { send };