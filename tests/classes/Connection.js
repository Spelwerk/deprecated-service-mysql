const { describe, it } = require('mocha');
const { assert } = require('chai');
const { config, fieldTitles, restrictedFields } = require('../test-data');
const Connection = require('../../src/classes/Connection');

describe('Connection', () => {
    it('Connection', async () => {
        const connection = new Connection(config, fieldTitles, restrictedFields);
        assert.isObject(connection.config);
        assert.isObject(connection.fieldTitles);
        assert.isArray(connection.restrictedFields);

        await connection.connect();
        assert.isObject(connection.pool);
        assert.isArray(connection.array);
        assert.isObject(connection.schema);

        const pool = connection.getPool();
        assert.isObject(pool);

        const schema = connection.getSchema();
        assert.isObject(schema);
    });
});
