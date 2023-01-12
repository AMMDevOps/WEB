    //\\
   //  \\
  //====\\
 // APP  \\
let express = require('express');
let app = express();
app.set('view engine', 'ejs');
app.listen(3000, () => {console.log('Server started on port 3000');});

    //\\
   //  \\
  //====\\
 // FUNC \\
 let functions = require('./functions');

    //\\
   //  \\
  //====\\
 // BODY \\
let bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

    //\\
   //  \\
  //====\\
 // PATH \\
let path = require('path');

    //\\
   //  \\
  //====\\
 //  DB  \\
 const { Client } = require('pg');
 const client = new Client({host: 'localhost',port: 5432,database: 'amm',user: 'postgres',password: 'admin'});
 client.connect();

    //\\
   //  \\
  //====\\
 // CRYP \\
const bcrypt = require('bcrypt');

    //\\
   //  \\
  //====\\
 // GET  \\
app.get('/', (req, res) => {res.render(path.join(__dirname, 'public', 'index.ejs'), { name: 'Kyle' });});
app.get('/amm', (req, res) => {res.render(path.join(__dirname, 'public', 'main.ejs'));});

    //\\
   //  \\
  //====\\
 // POST \\
app.post('/login', async(req, res) => {
    let status = await functions.checkUser(req.body, client)
    console.log(status);
    if(status == true){
        res.redirect('/amm')
    }else {
        res.redirect('/?error=1');
    }
});
app.post('/register', (req, res) => {
    functions.genUser(req.body, client);
    res.redirect('/'); 
});