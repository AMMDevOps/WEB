let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let path = require('path');

app.get('/', (req, res) => {res.sendFile(path.join(__dirname, 'public', 'index.html'));});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});