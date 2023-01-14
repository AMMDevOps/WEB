const express = require('express');
const app = express();
const session = require('express-session');
const path = require('path');


app.set('view engine', 'ejs');
app.use(express.cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));

let functions = require('./modules/functions');

const { Client } = require('pg');
const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'amm',
    user: 'postgres',
    password: 'admin'
});
client.connect();


app.get('/', (req, res) => {
    res.render(path.join(__dirname, 'views', 'index.ejs'));
});

app.get('/js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Scripts', 'main.js'));
});

app.get('/main', (req, res) => {
    res.render(path.join(__dirname, 'views', 'main.ejs'), { name: req.session.username });
});

app.post('/login', async(req, res) => {
    let status = await functions.checkUser(req.body, client)
    console.log(status);
    if(status == true){
        res.cookie('username', req.body.username);
        res.redirect(`/main`);
    } else {
        res.redirect('/');
    }
});

app.post('/register', (req, res) => {
    functions.genUser(req.body, client);
    res.redirect('/'); 
});

app.listen(3000, () => {console.log('Server started on port 3000');});