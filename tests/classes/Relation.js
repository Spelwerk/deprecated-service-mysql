const { describe, it, before } = require('mocha');
const { assert } = require('chai');
const { config, fieldTitles, restrictedFields } = require('../test-data');
const Connection = require('../../src/classes/Connection');
const Relation = require('../../src/classes/Relation');

describe('Relation', () => {
    let connection;
    let relationClass;

    before(async () => {
        connection = new Connection(config, fieldTitles, restrictedFields);
        await connection.connect();
        relationClass = new Relation(connection.getPool(), connection.getSchema());
    });

    it('constructor', () => {
        assert.isObject(relationClass.Query);
        assert.isFunction(relationClass.INSERT);
        assert.isFunction(relationClass.UPDATE);
        assert.isFunction(relationClass.DELETE);
    });

    it('INSERT', async () => {
        const tableName = 'expertise';
        const relation = 'attribute';
        const tableId = 1;
        const relationId = 1;
        const payload = { value: 4 };

        try {
            await relationClass.INSERT(tableName, relation, tableId, relationId, payload);
        } catch (err) {
            console.error(err);
            throw err;
        }
    });

    it('UPDATE', async () => {
        const tableName = 'expertise';
        const relation = 'attribute';
        const tableId = 1;
        const relationId = 1;
        const payload = { value: 8 };

        try {
            await relationClass.UPDATE(tableName, relation, tableId, relationId, payload);
        } catch (err) {
            console.error(err);
            throw err;
        }
    });

    it('DELETE', async () => {
        const tableName = 'expertise';
        const relation = 'attribute';
        const tableId = 1;
        const relationId = 1;

        try {
            await relationClass.DELETE(tableName, relation, tableId, relationId);
        } catch (err) {
            console.error(err);
            throw err;
        }
    });
});
