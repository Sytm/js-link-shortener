"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
function randomString(length) {
    let chars = [];
    for (let iteration = 0; iteration < length; iteration++) {
        chars.push(alphabet.charAt(Math.floor(Math.random() * alphabet.length)));
    }
    return chars.join('');
}
exports.randomString = randomString;
