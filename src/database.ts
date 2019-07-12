// Knex
import * as knex from 'knex';
// Misc imports
// File imports
import { Main } from './main';
import { Helper } from './helper';
import { Settings } from './settings';

export class Database {

    public knexConnection: knex<any, any[]>;
    public linkStorage: LinkStorage;

    constructor(private settings: Settings) {
        this.knexConnection = knex({
            client: 'sqlite3',
            connection: {
                filename: settings.databasePath
            },
            log: {
                warn(message) {
                    Main.getLogger().warn(message);
                },
                error(message) {
                    Main.getLogger().error(message);
                },
                deprecate(message) {
                    Main.getLogger().warn(message);
                },
                debug(message) {
                    Main.getLogger().debug(message);
                }
            },
            useNullAsDefault: true
        });
        this.linkStorage = new LinkStorage(this, settings);
    }
}

class LinkStorage {

    constructor(private database: Database, private settings: Settings) {
        this.createTable();
    }

    public getLink(this: LinkStorage, id: string, callback: (linkData: (ILinkData | null)) => void): void {
        this.database.knexConnection.select('*').where('id', id).from<ILinkData>('links').then((linkDatas) => {
            if (linkDatas.length > 0) {
                callback(linkDatas[0]);
            } else {
                callback(null);
            }
        });
    }

    public getLinkByURL(this: LinkStorage, url: string, callback: (linkData: (ILinkData | null)) => void): void {
        this.database.knexConnection.select('*').where('url', url).from<ILinkData>('links').then((linkDatas) => {
            if (linkDatas.length > 0) {
                callback(linkDatas[0]);
            } else {
                callback(null);
            }
        });
    }

    public createLink(this: LinkStorage, url: string, callback: (linkData: (ILinkData | null)) => void): void {
        this.getLinkByURL(url, (linkData) => {
            if (linkData == null) {
                this.createLink0(url, callback);
            } else {
                callback(linkData);
            }
        });
    }

    // Recursively create a link, if one already exists with that id
    private createLink0(this: LinkStorage, url: string, callback: (linkData: (ILinkData | null)) => void): void {
        let id = Helper.randomString(this.settings.randomIdLength);
        this.getLink(id, (linkData) => {
            if (linkData == null) {
                let linkData = new LinkData(id, url, new Date().getTime());
                this.database.knexConnection<ILinkData>('links').insert(linkData).then((result) => {
                    callback(linkData);
                });
            } else {
                this.createLink0(url, callback);
            }
        });
    }

    private createTable(): void {
        this.database.knexConnection.schema.hasTable('links').then((exists) => {
            if (!exists) {
                return this.database.knexConnection.schema.createTable('links', (table) => {
                    table.string('id').notNullable().primary();
                    table.string('url', 1024).notNullable().primary();
                    table.bigInteger('link_created_at').nullable();
                });
            }
        });
    }
}

interface ILinkData {
    id: string,
    url: string,
    link_created_at: number
}

class LinkData implements ILinkData {
    constructor(public id: string, public url: string, public link_created_at: number) {
    }
}