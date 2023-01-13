import {db} from "../database.js";

    export function getAllBooks(req, res) {
        db.serialize(() => {
            db.all('SELECT * FROM books', (error, row) => {
                res.json({data: row});
            });
        });
    }


    export function getBook(req, res) {
        db.serialize(() => {
            db.get('SELECT * FROM books WHERE id=' + +req.params.id, (error, row) => {
                res.json({data: row});
            });
        });
    }

    export function createBook(req, res) {
        const body = req.body;
        const user = req.user;
        db.serialize(() => {
            db.get('SELECT * FROM users WHERE id=' + user?.id, (error, row) => {
                if(row?.access_level > 0)
                {
                    db.run(`INSERT INTO books(title, year, category) VALUES ("${body.title}", ${body.year}, "${body.category}")`, function (error) {
                        res.json({data: this.lastID});
                    });
                } else {
                    res.json({data: false});
                }
            });
        });
    }

    export function deleteBook(req, res) {
        const user = req.user;
        db.serialize(() => {
            db.get('SELECT * FROM users WHERE id=' + user?.id, (error, row) => {
                if(row?.access_level > 0)
                {
                    db.exec(`DELETE FROM books WHERE id=${+req.params.id}`, (error, row) => {
                        res.json({data: true});
                    });
                } else {
                    res.json({data: false});
                }
            });
        });
    }

    export function updateBook(req, res) {
        const user = req.user;
        const body = req.body;
        db.serialize(() => {
            db.get('SELECT * FROM users WHERE id=' + user?.id, (error, row) => {
                if(row?.access_level > 0)
                {
                    db.exec(`UPDATE books SET title="${body.title}", year=${body.year}, category="${body.category}" WHERE id=${+req.params.id}`, (error, row) => {
                        res.json({data: true});
                    });
                } else {
                    res.json({data: false});
                }
            });
        });
    }

    export function searchBook(req, res) {
        const body = req.body;
        db.serialize(() => {
            console.log('Searching for books with category', body.category);
            db.all(`SELECT * FROM books WHERE category LIKE "%${body.category}%"`, (error, row) => {
                res.json({data: row});
            });
        });
    }
