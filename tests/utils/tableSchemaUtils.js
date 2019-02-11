const { describe, it, before } = require('mocha');
const { assert } = require('chai');
const { config, fieldTitles, restrictedFields } = require('../test-data');
const Connection = require('../../src/classes/Connection');
const tableSchemaUtils = require('../../src/utils/tableSchemaUtils');

describe('tableSchemaUtils', () => {
    let connection;
    let pool;
    let databaseName;
    let tablesArray;

    const tableName = 'account';

    before(async () => {
        connection = new Connection(config, fieldTitles, restrictedFields);
        await connection.connect();
        pool = connection.getPool();
        databaseName = connection.config.database;
        tablesArray = [ ...connection.array ];
    });

    it('getTableSchema', async () => {
        const result = await tableSchemaUtils.getTableSchema(
            tableName,
            pool,
            databaseName,
            tablesArray,
            fieldTitles,
            restrictedFields
        );

        assert.isBoolean(result.isTopTable);
        assert.isObject(result.security);
        assert.isObject(result.allows);
        assert.isObject(result.fields);
        assert.isObject(result.relations);
    });
});
