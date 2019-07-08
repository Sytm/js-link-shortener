const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export function randomString(length: number): string {
    let chars = [];

    for (let iteration = 0; iteration < length; iteration++) {
        chars.push(alphabet.charAt(Math.floor(Math.random() * alphabet.length)));
    }

    return chars.join('');
}