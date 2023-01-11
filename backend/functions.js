//DB
let checkUser = async (data, db) => {
    let username = data.username;
    let password = data.password;
    let sql = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    let result = await db.query(sql);
    console.log(result.rows);
    if (result.rows.length > 0){return true;}
    else {return false;}
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
    checkUser,
    genUser
};
