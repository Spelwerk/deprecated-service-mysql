const _ = require('lodash');
const mysql = require('mysql2');
const utility = require('spelwerk-service-utility');
const commonErrors = require('spelwerk-common-errors');

const queryUtils = require('../utils/queryUtils');
const logger = require('../utils/logger');

const { contains, isEmpty } = utility.common;

const {
    DBDeleteError,
    DBDuplicateEntryError,
    DBError,
    DBHideError,
    DBHideNotSupportedError,
    DBRowNotFoundError,
    DBUniqueKeyError,
    DBUpdateError,
} = commonErrors;

module.exports = class Query {
    /**
     * @constructor
     * @param {object} pool
     * @param {object} schema
     */
    constructor(pool, schema) {
        this.pool = pool;
        this.schema = schema;
    }

    /**
     * @public
     * @param {string} query
     * @param {array} params
     * @returns {Promise<array|number>}
     */
    async SQL(query, params) {
        try {
            if (Array.isArray(params)) {
                query = mysql.format(query, params);
            }

            logger.debug(query);

            let data;
            const result = await this.pool.query(query);

            if (contains(query, 'SELECT')) {
                const rows = result[0];
                const fields = result[1];
                data = queryUtils.formatRows(rows, fields);
            } else if (contains(query, 'INSERT')) {
                const insert = result[0];
                data = insert.insertId;
            } else if (contains(query, 'UPDATE')) {
                const changed = result[0];
                data = changed.changedRows;
            } else if (contains(query, 'DELETE')) {
                const affected = result[0];
                data = affected.affectedRows;
            }

            return data;
        } catch (err) {
            logger.error(err);

            if (err.code === 'ER_DUP_ENTRY') {
                throw new DBDuplicateEntryError(err);
            } else {
                throw new DBError(err);
            }
        }
    }

    /**
     * @public
     * @param {string} table
     * @param {array} what
     * @param {object} where
     * @param {object} options
     * @returns {Promise<array|number>}
     */
    async SELECT(table, what, where, options) {
        const schema = this.schema[table];

        let query = 'SELECT ';
        const array = [];

        if (!what || !what.length || what[0] === '*') {
            query += '*, ';
        } else {
            _.forEach(what, (item) => {
                if (!queryUtils.isKeyInSchema(item, schema)) return;
                query += `${item}, `;
            });
        }

        query = `${query.slice(0, -2)} FROM ${table}`;

        if (where && Object.keys(where).length) {
            where = queryUtils.snakeCaseKeys(where);

            query = `${query} WHERE `;

            _.forEach(where, (value, key) => {
                if (isEmpty(value)) return;
                if (!queryUtils.isKeyInSchema(key, schema)) return;

                if (value === 'NULL') {
                    query += `${key} IS NULL AND `;
                } else {
                    query += `${key} = ? AND `;
                    array.push(value);
                }
            });

            query = query.slice(0, -5);
        }

        if (options && options.sortBy) {
            query += ' ORDER BY ';

            _.forEach(options.sortBy, (ascDesc, expression) => {
                expression = _.snakeCase(expression);
                query += `${expression} ${ascDesc}, `;
            });

            query = query.slice(0, -2);
        }

        if (options && options.limit && options.limit !== null && options.limit !== '') {
            query += ` LIMIT ${options.limit}`;
        }

        if (options && options.offset && options.offset !== null && options.offset !== '') {
            query += ` OFFSET ${options.offset}`;
        }

        const result = await this.SQL(query, array);

        if (options && options.expectingResult && (!result || !result.length)) {
            throw new DBRowNotFoundError;
        }

        return result;
    }

    /**
     * @public
     * @param {string} table
     * @param {object} where
     * @returns {Promise<number>}
     */
    async COUNT(table, where) {
        const schema = this.schema[table];

        let query = `SELECT COUNT(*) FROM ${table}`;
        const array = [];

        if (where && Object.keys(where).length) {
            where = queryUtils.snakeCaseKeys(where);

            query = `${query} WHERE `;

            _.forEach(where, (value, key) => {
                if (isEmpty(value)) return;
                if (!queryUtils.isKeyInSchema(key, schema)) return;

                if (value === 'NULL') {
                    query += `${key} IS NULL AND `;
                } else {
                    query += `${key} = ? AND `;
                    array.push(value);
                }
            });

            query = query.slice(0, -5);
        }

        const result = await this.SQL(query, array);

        return result[0].count;
    }

    /**
     * @public
     * @param {string} table
     * @param {object} payload
     * @param {object} duplicates
     * @returns {Promise<number>}
     */
    async INSERT(table, payload, duplicates) {
        payload = queryUtils.snakeCaseKeys(payload);

        const schema = this.schema[table];

        let query = `INSERT INTO ${table} (`;
        let values = ' VALUES (';
        const array = [];

        _.forEach(payload, (value, key) => {
            if (isEmpty(value)) return;
            if (!queryUtils.isKeyInSchema(key, schema)) return;

            query += `${key}, `;
            values += '?, ';
            array.push(value);
        });

        if (!array.length) {
            return null;
        }

        query = `${query.slice(0, -2)})`;
        values = `${values.slice(0, -2)})`;
        query += values;

        if (duplicates && Object.keys(duplicates).length) {
            duplicates = queryUtils.snakeCaseKeys(duplicates);

            query += ' ON DUPLICATE KEY UPDATE ';

            _.forEach(duplicates, (value, key) => {
                if (isEmpty(value)) return;
                if (!queryUtils.isKeyInSchema(key, schema)) return;

                query += `${key} = VALUES(${key}), `;
            });

            query = query.slice(0, -2);
        }

        return this.SQL(query, array);
    }

    /**
     * @public
     * @param {string} table
     * @param {object} payload
     * @param {object} where
     * @returns {Promise<number>}
     */
    async UPDATE(table, payload, where) {
        payload = queryUtils.snakeCaseKeys(payload);
        where = queryUtils.snakeCaseKeys(where);

        const schema = this.schema[table];

        let query = `UPDATE ${table} SET `;
        const array = [];
        let whereExists;

        _.forEach(payload, (value, key) => {
            if (isEmpty(value)) return;
            if (!queryUtils.isKeyInSchema(key, schema)) return;

            query += `${key} = ?, `;
            array.push(value);
        });

        if (schema.fields.important.updated) {
            query += 'updated = CURRENT_TIMESTAMP, ';
        }

        query = `${query.slice(0, -2)} WHERE `;

        _.forEach(where, (value, key) => {
            if (isEmpty(value)) return;
            if (!queryUtils.isKeyInSchema(key, schema)) return;

            query += `${key} = ? AND `;
            array.push(value);
            whereExists = true;
        });

        if (!array || !array.length) {
            throw new DBUpdateError;
        }

        if (!whereExists) {
            throw new DBUniqueKeyError;
        }

        query = query.slice(0, -5);

        return this.SQL(query, array);
    }

    /**
     * @public
     * @param {string} table
     * @param {object} where
     * @returns {Promise<number>}
     */
    async HIDE(table, where) {
        where = queryUtils.snakeCaseKeys(where);

        const schema = this.schema[table];

        if (!schema.fields.important.deleted) {
            throw new DBHideNotSupportedError;
        }

        let query = `UPDATE ${table} SET updated = CURRENT_TIMESTAMP, deleted = 1 WHERE `;
        const array = [];
        let whereExists;

        _.forEach(where, (value, key) => {
            if (isEmpty(value)) return;
            if (!queryUtils.isKeyInSchema(key, schema)) return;

            query += `${key} = ? AND `;
            array.push(value);
            whereExists = true;
        });

        if (!array || !array.length) {
            throw new DBHideError;
        }

        if (!whereExists) {
            throw new DBUniqueKeyError;
        }

        query = query.slice(0, -5);

        return this.SQL(query, array);
    }

    /**
     * @public
     * @param {string} table
     * @param {object} where
     * @returns {Promise<number>}
     */
    async DELETE(table, where) {
        where = queryUtils.snakeCaseKeys(where);

        const schema = this.schema[table];

        let query = `DELETE FROM ${table} WHERE `;
        const array = [];
        let whereExists;

        _.forEach(where, (value, key) => {
            if (isEmpty(value)) return;
            if (!queryUtils.isKeyInSchema(key, schema)) return;

            query += `${key} = ? AND `;
            array.push(value);
            whereExists = true;
        });

        if (!array || !array.length) {
            throw new DBDeleteError;
        }

        if (!whereExists) {
            throw new DBUniqueKeyError;
        }

        query = query.slice(0, -5);

        return this.SQL(query, array);
    }
};
