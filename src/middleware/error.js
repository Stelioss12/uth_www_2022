export const defaultHandler = (req, res) => {
    res.sendFile('index.html', {
        root: './frontend',
    });
};
