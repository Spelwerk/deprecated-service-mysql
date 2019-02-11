const { describe, it, before } = require('mocha');
const { assert } = require('chai');
const { config, fieldTitles, restrictedFields } = require('../test-data');
const Connection = require('../../src/classes/Connection');
const Association = require('../../src/classes/Association');

describe('Association', () => {
    let connection;
    let associationClass;

    before(async () => {
        connection = new Connection(config, fieldTitles, restrictedFields);
        await connection.connect();
        associationClass = new Association(connection.getPool(), connection.getSchema());
    });

    it('constructor', () => {
        assert.isObject(associationClass.Query);
        assert.isFunction(associationClass.INSERT);
        assert.isFunction(associationClass.DELETE);
    });

    it('INSERT', async () => {
        const tableName = 'attribute';
        const association = 'species';
        const tableId = 1;
        const associationId = 1;

        try {
            await associationClass.INSERT(tableName, association, tableId, associationId);
        } catch (err) {
            console.error(err);
            throw err;
        }
    });

    it('DELETE', async () => {
        const tableName = 'attribute';
        const association = 'species';
        const tableId = 1;
        const associationId = 1;

        try {
            await associationClass.DELETE(tableName, association, tableId, associationId);
        } catch (err) {
            console.error(err);
            throw err;
        }
    });
});
