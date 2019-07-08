import url = require("url");
import express = require("express");
import validUrl = require("valid-url");
import { LinkStorage, LinkData, ServerSettings } from './storage';
import { JsonResponse, State } from './response';

var app = express();

app.use(express.urlencoded({ extended: true }));

var linkStorage = new LinkStorage('./settings.json');

function serveLinkNotFound(res: express.Response) {
    res.writeHead(404, 'No such link', {'Content-Type': 'text/html'});
    res.write(linkStorage.serverSettings.getSite('no_such_link').content);
    res.end();
}

function serveSiteNotFound(res: express.Response) {
    res.writeHead(404, 'No such page', {'Content-Type': 'text/html'});
    res.write(linkStorage.serverSettings.getSite('no_such_site').content);
    res.end();
}

app.post('/create', (req, res) => {
    let urlToCreate = req.body.url;
    if (urlToCreate) {
        let validUrlResult = validUrl.isWebUri(urlToCreate);
        if (typeof urlToCreate === 'string' && !validUrlResult) {
            res.status(200).json(new JsonResponse(State.INVALID, 'The provided url is not a valid url!', ''));
            res.end();
            return;
        }
        let linkData = linkStorage.createLink(validUrlResult as string);
        res.status(200).json(new JsonResponse(State.SUCCESS, 'Link successfully created!', linkData.id));
        res.end();
        linkStorage.save();
        return;
    }
    res.status(200).json(new JsonResponse(State.INVALID, 'No url is provided', ''));
    res.end();
});

app.get('/l/*', (req, res) => {
    let parsedUrl = url.parse(req.url);
    let id = parsedUrl.pathname.substring(3);
    let linkData = linkStorage.getLink(id);
    if (linkData != null) {
        res.writeHead(301, 'Permanent redirect', {'Location': linkData.dest_url});
        res.end();
        return;
    }
    serveLinkNotFound(res);
});

app.get('/', (req, res) => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(linkStorage.serverSettings.getSite('create').content);
    res.end();
});

app.use('/static', express.static('./static'));

app.get('*', (req, res) => {
    serveSiteNotFound(res);
});

app.listen(linkStorage.serverSettings.port, () => {
    console.log('Express web server started on port ' + linkStorage.serverSettings.port + '!');
});