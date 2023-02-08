let db = require('./db');

let getChatPage = async (data) => {
    let inf = data.split(' ')[0];
    let page = inf.split(';')[0];
    let room_id = inf.split(';')[1];
    let sql = `SELECT * FROM message WHERE roomid = ${room_id} AND page = ${page}`;
    let res = await db.pls(sql)
    let messages = res.rows;
    let messages_formated = [];
    for(let i = 0; i < messages.length; i++){
        let user = await getUserName(messages[i].userid);
        messages_formated.push({id: messages[i].id, user: user, message: messages[i].message, time: messages[i].time, page: messages[i].page});
    }
    return messages_formated;
}

let getUserSocket = async (userid) => {
    let sql = `SELECT * FROM users WHERE id = ${userid}`;
    let result = await db.pls(sql);
    return result.rows[0].socketid;
}

let getSecSocketID = async (data) => {
    let room = data.split(';')[1];
    let user = data.split(';')[2];

    let userid = await getUserId(user);

    let sql = `SELECT * FROM room WHERE id = ${room}`;
    let result = await db.pls(sql);
    let socket = '';
    if (result.rows[0].useroneid == userid) {
        socket = await getUserSocket(parseInt(result.rows[0].usertwoid));
    } else {
        socket = await getUserSocket(parseInt(result.rows[0].useroneid));
    }
    console.log(socket);
    return socket;
}

let setSocket = async (username, socket) => {
    let sql = `UPDATE users SET socketid = '${socket}' WHERE username = '${username}'`;
    db.pls(sql);
}

let formatToMSG = (data)=>{
    let format = data.split(' ')[0];
    let msg = format.split(';')[0];
    let room = format.split(';')[1];
    let user = format.split(';')[2];
    sendMsg({msg: msg, room: room}, user);
    //working
    
}

getPageId = async (room_id) => {
    let sql = `SELECT * FROM message WHERE roomid = ${room_id}`;
    let data = await db.pls(sql);
    let all = data.rows.length;
    console.log("all", all);
    let page = Math.ceil(all / 19);
    console.log("page", page);
    return page;
}

let sendMsg = async (data, username) => {
    let time = getDateNow();
    let room_id = parseInt(data.room);
    let user_id = await getUserId(username);
    let page = await getPageId(room_id);
    let sql = `INSERT INTO message (roomid, userid, message, time, page) VALUES (${room_id}, ${user_id}, '${data.msg}', '${time}', ${page})`;
    db.pls(sql);
}

let getDateNow = () => {
    let date_ob = new Date();
    // current date
    let day = ("0" + date_ob.getDate()).slice(-2);

    // current month
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

    // current year
    let year = date_ob.getFullYear();

    // current hours
    let hours = date_ob.getHours();

    // current minutes
    let minutes = date_ob.getMinutes();

    // current seconds
    let seconds = date_ob.getSeconds();

    // formating date & time in YYYY-MM-DD HH:MM:SS format
    date = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
    return date;
}

let getRoomMate = async (room_id, username) => {
    let userid = await getUserId(username);
    let sql = `SELECT * FROM room WHERE id = ${room_id}`;
    let data = await db.pls(sql);
    let room = data.rows[0];
    let room_mate = '';
    if (room.useroneid == userid) {
        room_mate = await getUserName(room.usertwoid);
    } else {
        room_mate = await getUserName(room.useroneid);
    }
    return room_mate;
}


let getChat = async (room_id) => {
    let sql = `SELECT * FROM message WHERE roomid = ${room_id}`;
    let data = await db.pls(sql);
    let messages = data.rows.reverse();
    let page = messages[0].page;
    let messages_formated = [];
    for(let i = 0; i < messages.length && i < 20; i++){
        if (messages[i].page != page) {}else {
        let user = await getUserName(messages[i].userid);
        messages_formated.push({id: messages[i].id, user: user, message: messages[i].message, time: messages[i].time, page: messages[i].page});
        }
    }
    return messages_formated.reverse();
}

let getRooms = async (username) => {
    console.log(username);
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
    console.log("alma", username);
    let sql = `SELECT id FROM users WHERE username = '${username}'`;
    let result = await db.pls(sql);
    console.log(result.rows);
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
let genRoom = async(u1, u2)=>{
    let sql =`INSERT INTO room (useroneid, usertwoid) VALUES (${u1}, ${u2})`;
    db.pls(sql)
}

module.exports = {
    getChatPage,
    getSecSocketID,
    formatToMSG,
    genRoom,
    setSocket,
    sendMsg,
    getRoomMate,
    getChat,
    getRooms,
    checkUser,
    genUser
};
