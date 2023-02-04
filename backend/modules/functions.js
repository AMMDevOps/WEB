let db = require('./db');


let getRooms = async (username) => {
    let id = await getUserId(username);
    let sql = `SELECT * FROM room WHERE useroneid  = ${id} OR usertwoid = ${id}`;
    let data = await db.pls(sql);
    let rooms = data.rows;
    let rooms_formated = [];
    for(let i = 0; i < rooms.length; i++){
        let user = '';
        if (rooms[i].useroneid == id) {
            user = await getUserName(rooms[i].usertwoid);
        } else {
            user = await getUserName(rooms[i].useroneid);
        } 
        rooms_formated.push({id: rooms[i].id, name: user});
    }
    return rooms_formated;
}

let getUserName = async (id) => {
    let sql = `SELECT username FROM users WHERE id = ${id}`;
    let result = await db.pls(sql);
    return result.rows[0].username;
}

let getUserId = async (username) => {
    let sql = `SELECT id FROM users WHERE username = '${username}'`;
    let result = await db.pls(sql);
    return result.rows[0].id;
}

//Check Login
let checkUser = async (data) => {
    let username = data.username;
    let password = data.password;
    let sql = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    let result = await db.pls(sql);

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
    getRooms,
    checkUser,
    genUser
};
