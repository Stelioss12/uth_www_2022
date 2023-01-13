import {db} from "../database.js";

export function getAllLinks(req, res) {
    db.serialize(() => {
        db.all('SELECT * FROM links', (error, row) => {
            res.json({data: row});
        });
    });
}


export function getLink(req, res) {
    db.serialize(() => {
        db.get('SELECT * FROM links WHERE id=' + +req.params.id, (error, row) => {
            res.json({data: row});
        });
    });
}

export function createLink(req, res) {
    const body = req.body;
    const user = req.user;
    db.serialize(() => {
        db.get('SELECT * FROM users WHERE id=' + user?.id, (error, row) => {
            if(row?.access_level > 0)
            {
                db.run(`INSERT INTO links(txt, url, category) VALUES ("${body.txt}", "${body.url}", "${body.category}")`, function (error) {
                    res.json({data: this.lastID});
                });
            } else {
                res.json({data: false});
            }
        });
    });
}

export function deleteLink(req, res) {
    const user = req.user;
    db.serialize(() => {
        db.get('SELECT * FROM users WHERE id=' + user?.id, (error, row) => {
            if(row?.access_level > 0)
            {
                db.exec(`DELETE FROM links WHERE id=${+req.params.id}`, (error, row) => {
                    res.json({data: true});
                });
            } else {
                res.json({data: false});
            }
        });
    });
}

export function updateLink(req, res) {
    const user = req.user;
    const body = req.body;
    db.serialize(() => {
        db.get('SELECT * FROM users WHERE id=' + user?.id, (error, row) => {
            if(row?.access_level > 0)
            {
                db.exec(`UPDATE links SET url="${body.url}", txt="${body.txt}", category="${body.category}" WHERE id=${+req.params.id}`, (error, row) => {
                    res.json({data: true});
                });
            } else {
                res.json({data: false});
            }
        });
    });
}

export function searchLink(req, res) {
    const body = req.body;
    db.serialize(() => {
        db.all(`SELECT * FROM links WHERE category LIKE "%${body.category}%"`, (error, row) => {
            res.json({data: row});
        });
    });
}