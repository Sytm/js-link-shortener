import * as fs from 'fs';
import * as path from 'path';

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
}