CREATE DATABASE amm;
\C amm
CREATE TABLE users (id SERIAL PRIMARY KEY,username VARCHAR(16) NOT NULL,password VARCHAR(16) NOT NULL, email VARCHAR(30) NOT NULL, auth Int, socketid VARCHAR(25));
CREATE TABLE room (id SERIAL PRIMARY KEY, useroneid INT, usertwoid INT);
CREATE TABLE message (roomid INT, userid INT, message VARCHAR(300), page INT, time TIMESTAMP);
