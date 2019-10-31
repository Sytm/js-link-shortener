const express = require('express');
const paths = require('./paths');
const pages = require('./pages');

const app = express();

function setup(settings, database) {
    app.get('/', (req, res) => {
        res.status(200).send(pages.getPage('create'));
    });
    
    app.get('/:id', (req, res) => {
        let id = req.params.id;
    });
    
    app.use('static', express.static(paths.static));
    
    app.all('*', (req, res) => {
        res.status(404).send(pages.getPage('404'));
    });

    app.listen(settings.port);
}

module.exports = {
    setup
}