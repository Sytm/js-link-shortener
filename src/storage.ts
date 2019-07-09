import fs = require("fs");
import path = require("path");
import { randomString } from './helper';

export class LinkStorage {

    public serverSettings: ServerSettings;
    public linkData: LinkData[];

    constructor(serverSettingsPath: string) {
        if (fs.existsSync(serverSettingsPath)) {
            this.serverSettings = new ServerSettings(fs.readFileSync(serverSettingsPath, 'utf8'));
        } else {
            this.serverSettings = new ServerSettings(
                {
                    randomIdLength: 10,
                    port: 8089,
                    storagePath: './data/storage.json',
                    sites: [
                        {
                            identifier: 'create',
                            filePath: './pages/create.html',
                            checkForUpdates: false
                        },
                        {
                            identifier: 'no_such_link',
                            filePath: './pages/link_not_found.html',
                            'checkForUpdates': false
                        },
                        {
                            identifier: 'no_such_site',
                            filePath: './pages/site_not_found.html',
                            checkForUpdates: false
                        }
                    ]
                }
            );
            fs.writeFileSync(serverSettingsPath, JSON.stringify(this.serverSettings.toJSON(), null, 4));
        }


        if (fs.existsSync(this.serverSettings.storagePath)) {
            this.linkData = JSON.parse(fs.readFileSync(this.serverSettings.storagePath, 'utf8'));
        } else {
            this.linkData = [];
        }
    }

    getLink(this: LinkStorage, id: string): LinkData | null {
        for (let index = 0; index < this.linkData.length; index++) {
            if (this.linkData[index].id === id) {
                return this.linkData[index];
            }
        }
        return null;
    }

    getLinkByURL(this: LinkStorage, url: string): LinkData | null {
        for (let index = 0; index < this.linkData.length; index++) {
            if (this.linkData[index].dest_url === url) {
                return this.linkData[index];
            }
        }
        return null;
    }

    createLink(this: LinkStorage, url: string): LinkData {
        let linkData = this.getLinkByURL(url);
        if (linkData !== null)
            return linkData;
        let id;
        do {
            id = randomString(this.serverSettings.randomIdLength);
        } while (this.getLink(id) != null);

        linkData = new LinkData(id, url, new Date().getTime());

        this.linkData.push(linkData);

        return linkData;
    }

    saveSync(this: LinkStorage): boolean {
        try {
            this.createParentFolderSync(this.serverSettings.storagePath);
            fs.writeFileSync(this.serverSettings.storagePath, JSON.stringify(this.linkData));
        } catch (error) {
            console.log("Error occured while saving link data:");
            console.log(error);
            return false;
        }
        return true;
    }

    save(this: LinkStorage): void {
        this.createParentFolder(this.serverSettings.storagePath, (error) => {
            if (error) {
                console.log("Error occured while creating folder for link-storage");
                console.log(error);
                return;
            }
            fs.writeFile(this.serverSettings.storagePath, JSON.stringify(this.linkData), (error) => {
                if (error) {
                    console.log("Error occured while saving link data:");
                    console.log(error);
                    return;
                }
            });
        });
    }

    private createParentFolderSync(filePath: string): void {
        let parentFolderPath = path.dirname(filePath);
        if (!fs.existsSync(parentFolderPath)) {
            fs.mkdirSync(parentFolderPath);
        }
    }

    private createParentFolder(filePath: string, callback: (err: NodeJS.ErrnoException | null) => void): void {
        let parentFolderPath = path.dirname(filePath);
        fs.exists(parentFolderPath, (exists) => {
            if (!exists) {
                fs.mkdir(parentFolderPath, callback);
            } else {
                callback(null);
            }
        });
    }
}

export class LinkData {

    constructor(public id: string, public dest_url: string, public creation: number) {

    }
}

interface IServerSettings {
    randomIdLength: number,
    port: number,
    storagePath: string,
    sites: ISite[]
}

interface ISite {
    identifier: string,
    filePath: string,
    checkForUpdates: boolean
}

export class ServerSettings {

    public randomIdLength: number;
    public port: number;
    public storagePath: string;
    public sites: Site[];

    constructor(settings: IServerSettings | string) {
        let asInterface: IServerSettings;

        if (typeof settings === "string") {
            asInterface = JSON.parse(settings) as IServerSettings;
        } else {
            asInterface = settings;
        }

        this.randomIdLength = asInterface.randomIdLength;
        this.port = asInterface.port;
        this.storagePath = asInterface.storagePath;
        this.sites = [];

        asInterface.sites.forEach(element => {
            this.sites.push(new Site(element.identifier, element.filePath, element.checkForUpdates));
        });
    }

    getSite(this: ServerSettings, identifier: string): Site | null {
        for (let index = 0; index < this.sites.length; index++) {
            if (this.sites[index].identifier === identifier) {
                return this.sites[index];
            }
        }
        return null;
    }

    toJSON(): IServerSettings {
        let jsonObj = {
            randomIdLength: this.randomIdLength,
            port: this.port,
            storagePath: this.storagePath,
            sites: []
        } as IServerSettings;
        this.sites.forEach(element => {
            jsonObj.sites.push(element.toJSON());
        });
        return jsonObj;
    }
}

export class Site {

    public content: string;

    constructor(public identifier: string, private filePath: string, private checkForUpdates: boolean) {
        this.content = fs.readFileSync(filePath, 'utf8');
        if (checkForUpdates) {
            fs.watch(filePath, (event, fileName) => {
                fs.readFile(filePath, { 'encoding': 'utf8' }, (error, data) => {
                    if (error) {
                        console.log('An error occured while reading the updated file contents of file ' + fileName);
                        console.log(error);
                        return;
                    }
                    this.content = data;
                });
            });
        }
    }

    toJSON(): ISite {
        return {
            identifier: this.identifier,
            filePath: this.filePath,
            checkForUpdates: this.checkForUpdates
        };
    }
}