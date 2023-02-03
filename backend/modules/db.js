const { Client } = require('pg');
const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'amm',
    user: 'postgres',
    password: 'admin'
});
client.connect();

let pls = async (sql) => {
    data = await client.query(sql);
    return data;
}

module.exports = {
    pls
}