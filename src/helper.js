const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function randomString(length) {
    let chars = [];

    for (let i = 0; i < length; i++) {
        chars.push(alphabet.charAt(randomInt(0, alphabet.length)));
    }

    return chars.join('');
}

function randomInt(min, max) {
    return min + Math.floor(Math.random() * max);
}

module.exports = {
    randomString,
    randomInt
}