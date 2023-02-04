CREATE DATABASE amm;
\C amm
CREATE TABLE users (id SERIAL PRIMARY KEY,username VARCHAR(50) NOT NULL,password VARCHAR(50) NOT NULL, email VARCHAR(50) NOT NULL, auth VARCHAR(50));
CREATE TABLE room (id SERIAL PRIMARY KEY, useroneid INT, usertwoid INT);
CREATE TABLE message (roomid INT, userid INT, message VARCHAR(300), time TIMESTAMP);
