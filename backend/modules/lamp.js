const SerialPort = require('serialport');
const port = new SerialPort('COM3', 9600);

port.on('open', function() {
    console.log('Port is open');
    const data = new Buffer.from('aa\n', 'utf-8')
    console.log(data);
    port.write(data);
    console.log('message written');
});

port.on('error', function (data) {
    console.log('Error: ', data);
});

port.on('data', function (data) {
    console.log('Data: ', data);
});

port.on('close', function (data) {
    console.log('Port is closed');
});

setTimeout(function() {
    port.close();
}, 3000);