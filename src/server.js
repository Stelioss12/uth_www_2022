import express from "express";
import {createBook, deleteBook, getAllBooks, searchBook, updateBook} from "./controllers/books.js";
import {defaultHandler} from "./middleware/error.js";
import { fileURLToPath } from 'url';
import * as path from 'path';
import {createLink, deleteLink, getAllLinks, searchLink, updateLink} from "./controllers/links.js";
import {login, register} from "./controllers/user.js";
import {authenticateUser} from "./middleware/auth.js";

export const app = express();
app.use(express.json());
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,PATCH,DELETE');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Access-Control-Allow-Origin,Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,Authorization',
    );
    next();
});

app.set('port', process.env.PORT || 3000);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '../frontend')));
// Books
app.get('/api/books/all', getAllBooks);
app.post('/api/books/search', searchBook);
app.post('/api/books/:id', authenticateUser, createBook);
app.patch('/api/books/:id', authenticateUser, updateBook);
app.delete('/api/books/:id', authenticateUser, deleteBook);

// Links
app.get('/api/links/all', getAllLinks);
app.post('/api/links/search', searchLink);
app.post('/api/links/:id', authenticateUser, createLink);
app.patch('/api/links/:id', authenticateUser, updateLink);
app.delete('/api/links/:id', authenticateUser, deleteLink);

// Users
app.post('/api/users/login', login);
app.post('/api/users/register', register);
// Default
app.use(defaultHandler);

const port = app.get('port');
export const server = app.listen(port, () => {
    const addr = server.address();
    const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
    console.log(`Listening on ${bind}`);
});
server.on('error', (error) => {
    console.error('ERROR:', error);
});