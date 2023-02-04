let db = require('./db');

//Check Login
let checkUser = async (data) => {
    let username = data.username;
    let password = data.password;
    let sql = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    let result = await db.pls(sql);
    console.log(result.rows[0]);

    if (result.rows.length > 0){return true;}
    else {return false;}
}

//Reg user
let genUser = (data) => {
    let username = data.username;
    let email = 'alma@gmail.com';
    let password1 = data.password;
    let password2 = data.password;
    if (password1 == password2) {
        let sql = `INSERT INTO users (username, password, email) VALUES ('${username}', '${password1}', '${email}')`;
        db.pls(sql, (err, res) => {if (err) {console.log(err);} else {console.log('User created');}});
        return true;
    }else {return false;}
}

module.exports = {
    checkUser,
    genUser
};
