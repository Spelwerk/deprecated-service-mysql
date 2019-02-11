const _ = require('lodash');
const utility = require('spelwerk-service-utility');
const logger = require('./logger');

const { contains } = utility.common;

/**
 * @param {string} tableName
 * @param {object} pool
 * @param {string} databaseName
 * @param {object} fieldTitles
 * @returns {Promise<object>}
 */
const getTableColumnData = async (tableName, pool, databaseName, fieldTitles) => {
    const data = {};

    const query = 'SELECT ' +
        'COLUMN_NAME, ' +
        'DATA_TYPE, ' +
        'IS_NULLABLE, ' +
        'CHARACTER_MAXIMUM_LENGTH ' +
        'FROM information_schema.columns ' +
        'WHERE TABLE_NAME = ? AND TABLE_SCHEMA = ?';

    const [ rows ] = await pool.execute(query, [ tableName, databaseName ]);

    _.forEach(rows, (column) => {
        const { COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE } = column;

        const name = COLUMN_NAME;
        const type = DATA_TYPE;
        const maximum = CHARACTER_MAXIMUM_LENGTH;
        const isMandatory = IS_NULLABLE === 'NO';

        if (!fieldTitles[name]) {
            logger.debug(`FieldTitle missing for: [ ${name} ]`);
        }

        data[name] = {
            title: fieldTitles[name],
            type,
            maximum,
            isMandatory,
        };
    });

    return data;
};

/**
 * @param {string} tableName
 * @returns {boolean}
 */
const getIsTopTable = (tableName) => {
    return tableName.indexOf('_') === -1;
};

/**
 * @param {string} tableName
 * @param {array} tablesArray
 * @returns {object}
 */
const getSecurity = (tableName, tablesArray) => {
    const security = {
        admin: false,
        account: false,
    };

    _.forEach(tablesArray, (arrayName) => {
        if (!contains(arrayName, tableName)) return;

        if (contains(arrayName, `account_has_${tableName}`)) {
            security.account = true;
        }
    });

    if (!security.account) {
        security.admin = true;
    }

    return security;
};

/**
 * @param {string} tableName
 * @param {array} tablesArray
 * @returns {object}
 */
const getAllows = (tableName, tablesArray) => {
    const allows = {
        comments: false,
        copies: false,
        images: false,
        labels: false,
    };

    _.forEach(tablesArray, (arrayName) => {
        if (!contains(arrayName, tableName)) return;

        if (contains(arrayName, `${tableName}_has_comment`)) {
            allows.comments = true;
        }

        if (contains(arrayName, `${tableName}_has_image`)) {
            allows.images = true;
        }

        if (contains(arrayName, `${tableName}_has_label`)) {
            allows.labels = true;
        }

        if (contains(arrayName, `${tableName}_is_copy`)) {
            allows.copies = true;
        }
    });

    return allows;
};

/**
 * @param {string} tableName
 * @param {object} pool
 * @param {string} database
 * @param {object} fieldTitles
 * @param {array} restrictedFields
 * @returns {Promise<object>}
 */
const getFields = async (tableName, pool, database, fieldTitles, restrictedFields) => {
    const fields = {
        important: {
            created: false,
            updated: false,
            deleted: false,
        },
        list: [],
        accepted: [],
        nonId: [],
        data: {},
    };

    const columnData = await getTableColumnData(tableName, pool, database, fieldTitles);

    _.forEach(columnData, (data, columnName) => {
        fields.list.push(columnName);

        if (columnName === 'created') {
            fields.important.created = true;
        }

        if (columnName === 'updated') {
            fields.important.updated = true;
        }

        if (columnName === 'deleted') {
            fields.important.deleted = true;
        }

        if (!contains(restrictedFields, columnName)) {
            fields.accepted.push(columnName);
        }

        if (!contains(columnName, '_id')) {
            fields.nonId.push(columnName);
        }

        fields.data[columnName] = data;
    });

    return fields;
};

/**
 * @param {string} tableName
 * @param {array} tablesArray
 * @returns {object}
 */
const getRelations = (tableName, tablesArray) => {
    const relations = {
        relations: [],
        associations: [],
    };

    _.forEach(tablesArray, (arrayName) => {
        if (arrayName === tableName) return;
        if (!contains(arrayName, tableName)) return;
        if (!contains([ 'comment', 'image', 'label', 'copy' ], arrayName)) return;

        if (contains(arrayName, '_has_')) {
            const pushName = arrayName.split('_has_')[1];
            relations.relations.push(pushName);
        }

        if (contains(arrayName, '_is_')) {
            const pushName = arrayName.split('_is_')[1];
            relations.associations.push(pushName);
        }
    });

    return relations;
};

module.exports = {
    getIsTopTable,
    getSecurity,
    getAllows,
    getFields,
    getRelations,
};
