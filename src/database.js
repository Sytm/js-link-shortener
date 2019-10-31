const mariadb = require('mariadb');
const helper = require('./helper');

const queries = {
    createTable = 'CREATE TABLE `linkshortener`.`links` ( `id` VARCHAR(20) NOT NULL , `ignoreCase` BOOLEAN NOT NULL , `url` TEXT NOT NULL , `createdAt` BIGINT NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB CHARSET=utf8 COLLATE utf8_general_ci;',
    selectLink = 'SELECT `url` FROM `links` WHERE `id` = (?) OR `id` = (?) AND `ignoreCase` = \'true\';',
    selectiId = 'SELECT `id` FROM `links` WHERE `id` = (?) OR `id` = (?) AND `ignoreCase` = \'true\';',
    insertLink = 'INSERT INTO `links`(`id`, `ignoreCase`, `url`, `createdAt`) VALUES (?,?,?,?)'
}

class LinkDatabase {

    constructor(options) {
        this.pool = mariadb.createPool(options);
    }

    async getLink(id) {
        let result = await this.pool.query(queries.selectLink, [id, id.toLowerCase()]);
        if (result.length > 0) {
            return result[0].url;
        }
        return undefined;
    }

    async linkExists(id) {
        let result = await this.pool.query(queries.selectId, [id, id.toLowerCase()]);
        return result.length > 0;
    }

    async createLink(url, ignoreCase) {
        let id;
        do {
            id = helper.randomString(6); // TODO config
        } while (!(await this.linkExists(id)));
        await this.pool.query(queries.insertLink, [id, ignoreCase, url, new Date().getTime()]);
        return id;
    }
}
/*
-> links
|-------------|-------------|-------------|-------------|
|     id      | ignoreCase  |     url     |  createdAt  |
| VARCHAR(20) |   BOOLEAN   |     TEXT    |    BIGINT   |
*/