import jwt from 'jsonwebtoken';
export const authenticateUser = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.json({
            message: 'unauthorized',
            data: false,
        });
    }
    const user = jwt.verify(token, 'secretkey1');
    req.user = user;
    return next();
};