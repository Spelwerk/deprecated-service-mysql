const _ = require('lodash');
const utility = require('spelwerk-service-utility');

const { contains } = utility.common;

/**
 * @param {object} object
 * @param {string} name
 */
const splitUnderscore = (object, name) => {
    const result = {};

    _.forEach(object, (value, key) => {
        const split = key.split('__');
        const splitCompare = split[0];
        const splitKey = split[1];
        const camelKey = _.camelCase(splitKey);

        if (contains(splitCompare, name)) {
            result[camelKey] = value;
        }
    });

    return result;
};

/**
 * @param {object} object
 */
const splitObject = (object) => {
    const result = {};

    _.forEach(object, (value, key) => {
        if (contains(key, '__')) {
            const name = key.split('__')[0];
            result[name] = splitUnderscore(object, name);
        } else {
            const camelKey = _.camelCase(key);
            result[camelKey] = value;
        }
    });

    return result;
};

/**
 * @param {object} input
 */
const snakeCaseKeys = (input) => {
    const result = {};

    _.forEach(input, (value, key) => {
        const snake = _.snakeCase(key);
        result[snake] = value;
    });

    return result;
};

/**
 * @param {string} key
 * @param {object} schema
 * @returns {boolean}
 */
const isKeyInSchema = (key, schema) => {
    return contains(schema.fields.list, key);
};

/**
 * Automatically formats the rows and prettifies them with true boolean and null values.
 * Loops through all rows
 *   Loops through all keys & values per row
 *     Loops through the fields array on every row
 *       Sets true boolean on columnType 1
 *     Sets true null on value ''
 *   Splits object on __ for every row
 *
 * @param {array} rows
 * @param {array} fields
 * @returns {array}
 */
const formatRows = (rows, fields) => {
    if (!rows || !rows.length || !fields) {
        return [];
    }

    const result = [];

    _.forEach(rows, (row) => {
        const item = row;

        _.forEach(item, (value, key) => {
            _.forEach(fields, (field) => {
                if (field.name === key && field.columnType === 1) {
                    value = value === 1;
                }
            });

            if (value === '') {
                value = null;
            }

            item[key] = value;
        });

        result.push(splitObject(item));
    });

    return result;
};

module.exports = {
    snakeCaseKeys,
    isKeyInSchema,
    formatRows,
};
