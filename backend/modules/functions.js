const bycript = require('bcryptjs');

let genKey =()=>{
    let date_ob = new Date();
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();
    let key = hours +""+ minutes +""+ seconds;
    return key;
}

//DB
let checkUser = async (data, db) => {
    let username = data.username;
    let password = data.password;
    let sql = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    let result = await db.query(sql);
    auth = await checkAuth(result.rows[0], db);

    if (result.rows.length > 0){return {data: auth, status:true};}
    else {return {data: false, status: false};}
}

let checkAuth = async (data, db) => {
    let username = data.username;
    let authkey = await bycript.hashSync(genKey(), 1);
    let sql = `UPDATE users SET auth = '${authkey}' WHERE username = '${username}'`;
    let result = await db.query(sql);
    return {auth: authkey, username: username, status: true};

}

let checkAuthed = async (data, db) => {
    let username = data.username;
    let auth = data.auth;
    let sql = `SELECT * FROM users WHERE username = '${username}'`;
    let result = await db.query(sql);
    if (result.rows[0].auth == auth){return {auth: auth, username: username, status: true};}
    else {return {auth: auth, username: username, status: false};}
}



//Reg user
let genUser = (data, db) => {
    let username = data.username;
    let email = data.email;
    let password1 = data.password1;
    let password2 = data.password2;
    if (password1 == password2) {
        let sql = `INSERT INTO users (username, password, email) VALUES ('${username}', '${password1}', '${email}')`;
        db.query(sql, (err, res) => {if (err) {console.log(err);} else {console.log('User created');}});
        return true;
    }else {return false;}
}

module.exports = {
    checkAuthed,
    checkUser,
    genUser
};
