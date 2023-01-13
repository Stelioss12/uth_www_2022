import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import {db} from "../database.js";

export function login(req, res) {
    const body = req.body;
    db.serialize(() => {
        db.get(`SELECT * FROM users WHERE username="${body.username}"`, async(error, user) => {
            if (!user) {
                res.json({data: false, text: 'User not found'});
                return;
            }
            if(await bcrypt.compare(body.password, user.password))
            {
                const token = jwt.sign(
                    { id: user.id, username: user.username },
                    "secretkey1",
                    {
                        expiresIn: "30d",
                    }
                );
                res.json({ access_token: token });
                return;
            }
            res.json({data: false});
        });
    });
}

export function register(req, res) {
    const body = req.body;
    db.get(`SELECT * FROM users WHERE username="${body.username}"`, async(error, user) => {
        if (user) {
           res.json({ message: 'User already exists' });
           return;
        }
        const hashedPassword = await bcrypt.hash(body.password, 8);
        db.run(`INSERT INTO users(username, password, access_level) VALUES ("${body.username}", "${hashedPassword}", 0)`, function (statement, err) {
            const token = jwt.sign(
                { id: this.lastID, username: body.username },
                "secretkey1",
                {
                    expiresIn: "30d",
                }
            );
            res.json({ access_token: token });
        });
    });
}