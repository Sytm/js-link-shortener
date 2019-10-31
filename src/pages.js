const fs = require('fs');
const path = require('path');
const paths = require('./paths');

const pageCache = new Map();

fs.readdirSync(paths.pages).forEach(file => {
    let filename = path.basename(file, path.extname(file));
    let content = fs.readFileSync(file, 'utf-8');
    pageCache.set(filename, content);
});

module.exports = {
    getPage = (name) => {
        if (pageCache.has(name)) {
            return undefined;
        } else {
            return pageCache.get(name);
        }
    }
}