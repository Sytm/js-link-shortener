import * as fs from 'fs';
import { Main } from './main';

var defaultSettings =
    {
        randomIdLength: 10,
        port: 8089,
        databasePath: './data/database.sqlite3',
        logFolder: './data/logs',
        sites: [
            {
                identifier: 'create',
                filePath: './pages/create.html',
                checkForUpdates: false
            },
            {
                identifier: 'no_such_link',
                filePath: './pages/link_not_found.html',
                checkForUpdates: false
            },
            {
                identifier: 'no_such_site',
                filePath: './pages/site_not_found.html',
                checkForUpdates: false
            }
        ]
    } as ISettings;

export class Settings {

    public port: number;
    public randomIdLength: number;
    public behindHttpsProxy: boolean;
    public cookieSecret: string;

    public databasePath: string;
    public logFolder: string;

    private sites: Site[];

    constructor(settingsPath: string) {
        let iSettings: ISettings;
        if (fs.existsSync(settingsPath)) {
            iSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
            // Extend parsed settings with defaults to fill in missing properties
            Object.assign(iSettings, defaultSettings);
        } else {
            iSettings = defaultSettings;
            // Write defaults to file to make it available for modifications by the user
            fs.writeFileSync(settingsPath, JSON.stringify(iSettings, null, 4));
        }

        // Assing values from settings object
        this.port = iSettings.port;
        this.randomIdLength = iSettings.randomIdLength;

        this.databasePath = iSettings.databasePath;
        this.logFolder = iSettings.logFolder;

        // Convert ISites to Sites to allow them to load
        this.sites = [];
        iSettings.sites.forEach(iSite => {
            this.sites.push(new Site(iSite.identifier, iSite.filePath, iSite.checkForUpdates));
        });
    }

    public getSite(this: Settings, identifier: string): Site | null {
        for (let index = 0; index < this.sites.length; index++) {
            if (this.sites[index].identifier === identifier) {
                return this.sites[index];
            }
        }
        return null;
    }
}

// A simple object site defining a site with an identifier, path to the file and an option to detect file changes
export class Site {

    public content: string;

    constructor(public identifier: string, filePath: string, checkForUpdates: boolean) {
        this.content = fs.readFileSync(filePath, 'utf8');
        if (checkForUpdates) {
            fs.watch(filePath, (event, fileName) => {
                Main.getLogger().info('Detected file change of file ' + fileName + '. Reloading page file');
                fs.readFile(filePath, { 'encoding': 'utf8' }, (error, data) => {
                    if (error) {
                        Main.getLogger().warn('An error occured while reading the updated file contents of file ' + fileName);
                        Main.getLogger().warn(error);
                        return;
                    }
                    this.content = data;
                    Main.getLogger().info('Reloaded page file ' + fileName);
                });
            });
        }
    }
}

export interface ISettings {
    port: number
    randomIdLength: number,
    databasePath: string,
    logFolder: string,
    sites: ISite[]
}

// This is required, because if you were to call JSON.stringify on a Site object, you'll also serialize the content read from the file
export interface ISite {
    identifier: string,
    filePath: string,
    checkForUpdates: boolean
}