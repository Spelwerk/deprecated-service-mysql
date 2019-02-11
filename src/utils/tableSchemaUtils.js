const tableDataUtils = require('./tableDataUtils');

/**
 * @param {string} tableName
 * @param {object} pool
 * @param {string} databaseName
 * @param {array} tablesArray
 * @param {object} fieldTitles
 * @param {array} restrictedFields
 * @returns {Promise<object>}
 */
const getTableSchema = async (tableName, pool, databaseName, tablesArray, fieldTitles, restrictedFields) => {
    const tableSchema = {};

    tableSchema.isTopTable = tableDataUtils.getIsTopTable(tableName);
    tableSchema.security = tableDataUtils.getSecurity(tableName, tablesArray);
    tableSchema.allows = await tableDataUtils.getAllows(tableName, tablesArray);
    tableSchema.fields = await tableDataUtils.getFields(tableName, pool, databaseName, fieldTitles, restrictedFields);
    tableSchema.relations = tableDataUtils.getRelations(tableName, tablesArray);

    return tableSchema;
};

module.exports = { getTableSchema };
