"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const helper_1 = require("./helper");
class LinkStorage {
    constructor(serverSettingsPath) {
        if (fs.existsSync(serverSettingsPath)) {
            this.serverSettings = new ServerSettings(fs.readFileSync(serverSettingsPath, 'utf8'));
        }
        else {
            this.serverSettings = new ServerSettings({
                'randomIdLength': 10,
                'port': 8089,
                'storagePath': './data/storage.json',
                'sites': [
                    {
                        'identifier': 'create',
                        'filePath': './pages/create.html',
                        'checkForUpdates': false
                    },
                    {
                        'identifier': 'no_such_link',
                        'filePath': './pages/link_not_found.html',
                        'checkForUpdates': false
                    },
                    {
                        'identifier': 'no_such_site',
                        'filePath': './pages/site_not_found.html',
                        'checkForUpdates': false
                    }
                ]
            });
            fs.writeFileSync(serverSettingsPath, JSON.stringify(this.serverSettings.toJSON(), null, 4));
        }
        if (fs.existsSync(this.serverSettings.storagePath)) {
            this.linkData = JSON.parse(fs.readFileSync(this.serverSettings.storagePath, 'utf8'));
        }
        else {
            this.linkData = [];
        }
    }
    getLink(id) {
        for (let index = 0; index < this.linkData.length; index++) {
            if (this.linkData[index].id === id) {
                return this.linkData[index];
            }
        }
        return null;
    }
    getLinkByURL(url) {
        for (let index = 0; index < this.linkData.length; index++) {
            if (this.linkData[index].dest_url === url) {
                return this.linkData[index];
            }
        }
        return null;
    }
    createLink(url) {
        let linkData = this.getLinkByURL(url);
        if (linkData !== null)
            return linkData;
        let id;
        do {
            id = helper_1.randomString(this.serverSettings.randomIdLength);
        } while (this.getLink(id) != null);
        linkData = new LinkData(id, url, new Date().getTime());
        this.linkData.push(linkData);
        return linkData;
    }
    saveSync() {
        try {
            this.createParentFolderSync(this.serverSettings.storagePath);
            fs.writeFileSync(this.serverSettings.storagePath, JSON.stringify(this.linkData));
        }
        catch (error) {
            console.log("Error occured while saving link data:");
            console.log(error);
            return false;
        }
        return true;
    }
    save() {
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
    createParentFolderSync(filePath) {
        let parentFolderPath = path.dirname(filePath);
        if (!fs.existsSync(parentFolderPath)) {
            fs.mkdirSync(parentFolderPath);
        }
    }
    createParentFolder(filePath, callback) {
        let parentFolderPath = path.dirname(filePath);
        fs.exists(parentFolderPath, (exists) => {
            if (!exists) {
                fs.mkdir(parentFolderPath, callback);
            }
            else {
                callback(null);
            }
        });
    }
}
exports.LinkStorage = LinkStorage;
class LinkData {
    constructor(id, dest_url, creation) {
        this.id = id;
        this.dest_url = dest_url;
        this.creation = creation;
    }
}
exports.LinkData = LinkData;
class ServerSettings {
    constructor(settings) {
        let asInterface;
        if (typeof settings === "string") {
            asInterface = JSON.parse(settings);
        }
        else {
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
    getSite(identifier) {
        for (let index = 0; index < this.sites.length; index++) {
            if (this.sites[index].identifier === identifier) {
                return this.sites[index];
            }
        }
        return null;
    }
    toJSON() {
        let jsonObj = {
            'randomIdLength': this.randomIdLength,
            'port': this.port,
            'storagePath': this.storagePath,
            'sites': []
        };
        this.sites.forEach(element => {
            jsonObj.sites.push(element.toJSON());
        });
        return jsonObj;
    }
}
exports.ServerSettings = ServerSettings;
class Site {
    constructor(identifier, filePath, checkForUpdates) {
        this.identifier = identifier;
        this.filePath = filePath;
        this.checkForUpdates = checkForUpdates;
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
    toJSON() {
        return {
            'identifier': this.identifier,
            'filePath': this.filePath,
            'checkForUpdates': this.checkForUpdates
        };
    }
}
exports.Site = Site;
