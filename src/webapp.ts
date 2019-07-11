// Express
import * as express from 'express';
// Express middlewares
import * as  helmet from 'helmet';
// Misc imports
import * as validUrl from 'valid-url';
import * as uuid4 from 'uuid4';
// File-imports
import { Settings } from './settings';
import { JsonResponse, State } from './response';
import { Main } from './main';
import { Database } from './database';

export class WebApp {

    public app: express.Express;
    public database: Database;

    constructor(public settings: Settings) {
        this.app = express();

        this.database = new Database(settings);

        this.setupMiddlewares();
        this.setupRouter();
    }

    public listen(callback?: (...args: any[]) => void) {
        this.app.listen(this.settings.port, callback);
    }

    private setupMiddlewares(): void {
        this.app.use(express.urlencoded({ extended: true }));

        // See https://www.npmjs.com/package/helmet#how-it-works for defaults
        this.app.use(helmet());

        this.app.use((req, res, next) => {
            let ip = req.ip
            if (req.headers['X-Real-IP'] !== undefined) {
                let headerIp = req.headers['X-Real-IP'];
                if (Array.isArray(headerIp)) {
                    ip = headerIp[0];
                } else {
                    ip = headerIp;
                }
            }

            Main.getLogger().debug(`${ip} - ${req.method.toUpperCase()} ${req.url}`);
            next();
        });

        this.app.use('/api/*', (req, res, next) => {
            // Never cache the responses from the api-section
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            next();
        });

        this.app.use((err, req, res, next) => {
            Main.getLogger().error('An error occurred while trying to serve a express page');
            Main.getLogger().error(err);
            next();
        });
        this.app.use('/api/*', (err, req, res, next) => {
            res.status(500).json(new JsonResponse(State.ERROR, err.message, ''));
            res.end();
        });
    }

    private setupRouter(): void {
        this.app.post('/api/create', (req, res) => {
            let urlToCreate = req.body.url;
            if (urlToCreate) {
                let validUrlResult = validUrl.isWebUri(urlToCreate);
                if (typeof urlToCreate === 'string' && !validUrlResult) {
                    res.status(200).json(new JsonResponse(State.INVALID, 'The provided url is not a valid url!', ''));
                    res.end();
                    return;
                }
                this.database.linkStorage.createLink(validUrlResult, (linkData) => {
                    res.status(200).json(new JsonResponse(State.SUCCESS, 'Link successfully created!', linkData.id));
                    res.end();
                });
                return;
            }
            res.status(200).json(new JsonResponse(State.INVALID, 'No url is provided', ''));
            res.end();
        });

        this.app.get('/l/*', (req, res) => {
            let id = new URL(req.url).pathname.substring(3);
            this.database.linkStorage.getLink(id, (linkData) => {
                if (linkData == null) {
                    res.writeHead(404, 'No such link', { 'Content-Type': 'text/html' });
                    res.write(this.settings.getSite('no_such_link').content);
                    res.end();
                } else {
                    res.writeHead(301, 'Permanent redirect', { 'Location': linkData.url });
                    res.end();
                    return;
                }
            });
        });

        this.app.get('/', (req, res) => {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(this.settings.getSite('create').content);
            res.end();
        });

        this.app.use('/static', express.static('./static'));

        this.app.get('*', (req, res) => {
            res.writeHead(404, 'No such page', { 'Content-Type': 'text/html' });
            res.write(this.settings.getSite('no_such_site').content);
            res.end();
        });
    }
}