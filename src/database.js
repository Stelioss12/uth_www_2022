import sqlite3 from "sqlite3";

export const db = new sqlite3.Database('data.db');
db.serialize(() => {
    db.exec('CREATE TABLE IF NOT EXISTS books(id integer primary key autoincrement , title varchar, year int, category varchar)');
    db.exec('CREATE TABLE IF NOT EXISTS links(id integer primary key autoincrement , url varchar, txt int, category varchar)');
    db.exec('CREATE TABLE IF NOT EXISTS users(id integer primary key autoincrement , username varchar, password int, access_level int)');
});