const { describe, it, before } = require('mocha');
const _ = require('lodash');
const { assert } = require('chai');
const { config, fieldTitles, restrictedFields } = require('../test-data');
const Connection = require('../../src/classes/Connection');
const tableDataUtils = require('../../src/utils/tableDataUtils');

describe('tableDataUtils', () => {
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

    it('getTableColumnData', () => {
        const result = tableDataUtils.getIsTopTable(tableName);
        assert.isTrue(result);
    });

    it('getSecurity', () => {
        const result = tableDataUtils.getSecurity(tableName, tablesArray);
        assert.isTrue(result.admin);
        assert.isFalse(result.account);
    });

    it('getAllows', async () => {
        const result = tableDataUtils.getAllows(tableName, tablesArray);
        assert.isFalse(result.comments);
        assert.isFalse(result.copies);
        assert.isFalse(result.images);
        assert.isFalse(result.labels);
    });

    it('getFields', async () => {
        const result = await tableDataUtils.getFields(tableName, pool, databaseName, fieldTitles, restrictedFields);
        assert.isArray(result.list);
        assert.isArray(result.accepted);
        assert.isArray(result.nonId);
        assert.isObject(result.data);

        _.forEach(result.data, (data, key) => {
            assert.isString(key);
            assert.isString(data.type);
            if (data.maximum !== null) {
                assert.isNumber(data.maximum);
            }
            assert.isBoolean(data.isMandatory);
        });
    });

    it('getRelations', () => {
        const result = tableDataUtils.getRelations(tableName, tablesArray);
        assert.isArray(result.relations);
        assert.isArray(result.associations);
    });
});
