const path = require('path');

const root = path.join(__dirname, '..');

const static = path.join(root, 'static');
const pages = path.join(root, 'pages');

module.exports = {
    root,
    static,
    pages
}