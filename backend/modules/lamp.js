const { SerialPort } = require('serialport');

const port = new SerialPort({
path: 'COM3',
baudRate: 9600,
dataBits: 8,
stopBits: 1,
parity: 'none',
});

port.on('open', function() {
    console.log('Port is open');
    const data = Buffer.from('Hello')
    port.write(data, function(err) {
        if (err) {return console.log('Error on write: ', err.message);  }
    console.log('message written');
    });
});