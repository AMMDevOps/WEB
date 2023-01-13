const express = require('express');
const app = express();
const session = require('express-session');


app.set('view engine', 'ejs');
app.use(express.static('public'));
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
    res.render('index.ejs');
});

app.get('/js', (req, res) => {
    res.sendFile('Scripts/main.js');
});

app.get('/main', (req, res) => {
    res.render('main.ejs', { name: req.session.username });
});

app.post('/login', async(req, res) => {
    let status = await functions.checkUser(req.body, client)
    console.log(status);
    if(status == true){
        req.session.username = req.body.username;
        res.end(req.session.username);
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