import * as fs from 'fs';
import * as path from 'path';
import * as validUrl from 'valid-url';

export class Helper {

    private static alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    public static randomString(length: number): string {
        let chars = [];

        for (let iteration = 0; iteration < length; iteration++) {
            chars.push(Helper.alphabet.charAt(Math.floor(Math.random() * Helper.alphabet.length)));
        }

        return chars.join('');
    }

    public static createFolderSync(folderPath: string): void {
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }
    }

    public static createFolder(folderPath: string, callback: (err: NodeJS.ErrnoException | null) => void): void {
        fs.exists(folderPath, (exists) => {
            if (exists) {
                callback(null);
            } else {
                fs.mkdir(folderPath, callback);
            }
        });
    }

    public static createParentFolderSync(filePath: string): void {
        Helper.createFolderSync(path.dirname(filePath));
    }

    public static createParentFolder(filePath: string, callback: (err: NodeJS.ErrnoException | null) => void): void {
        Helper.createFolder(path.dirname(filePath), callback);
    }

    public static isValidUrl(url: string): string | undefined {
        let modUrl = url;
        // Check if url is url at all
        if (validUrl.isWebUri(modUrl) !== undefined) {
            return url;
        }

        // If url start with '//', the valid-url doesnt accept it as valid, but the browser knows what to do
        if (url.startsWith('//')) {
            modUrl = 'http:' + url;
            if (validUrl.isWebUri(modUrl) !== undefined) {
                return url;
            }
        }

        // If a protocol has been omitted completly, try prepending it and checking again
        if (!url.startsWith('https://') && !url.startsWith('http://')) {
            modUrl = 'http://' + url;
            if (validUrl.isWebUri(modUrl) !== undefined) {
                return '//' + url;
            }
        }
        return undefined;
    }
}