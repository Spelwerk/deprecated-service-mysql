const { describe, it, before } = require('mocha');
const { assert } = require('chai');
const { randomHash } = require('spelwerk-service-utility');
const { config, fieldTitles, restrictedFields } = require('../test-data');
const Connection = require('../../src/classes/Connection');
const Query = require('../../src/classes/Query');

describe('Query', () => {
    let connection;
    let queryClass;
    let insertId;

    before(async () => {
        connection = new Connection(config, fieldTitles, restrictedFields);
        await connection.connect();
        queryClass = new Query(connection.getPool(), connection.getSchema());
    });

    it('constructor', async () => {
        assert.isObject(queryClass.pool);
        assert.isObject(queryClass.schema);

        assert.isFunction(queryClass.SQL);
        assert.isFunction(queryClass.SELECT);
        assert.isFunction(queryClass.COUNT);
        assert.isFunction(queryClass.INSERT);
        assert.isFunction(queryClass.UPDATE);
        assert.isFunction(queryClass.HIDE);
        assert.isFunction(queryClass.DELETE);
    });

    it('SQL', async () => {
        const query = 'SELECT * FROM account WHERE id = ?';
        const param = [ 1 ];

        try {
            const results = await queryClass.SQL(query, param);
            const result = results[0];
            assert.isNumber(result.id);
            assert.isString(result.email);
            assert.isBoolean(result.isVerified);
        } catch (err) {
            console.error(err);
            throw err;
        }
    });

    it('SELECT', async () => {
        const table = 'account';
        const what = [];
        const where = {};
        const options = {};

        try {
            const results = await queryClass.SELECT(table, what, where, options);
            assert.isString(results[0].displayName);
        } catch (err) {
            console.error(err);
            throw err;
        }
    });

    it('SELECT [*]', async () => {
        const table = 'account';
        const what = [ '*' ];
        const where = {};
        const options = {};

        try {
            const results = await queryClass.SELECT(table, what, where, options);
            assert.isString(results[0].displayName);
        } catch (err) {
            console.error(err);
            throw err;
        }
    });

    it('SELECT [what]', async () => {
        const table = 'account';
        const what = [ 'display_name' ];
        const where = {};
        const options = {};

        try {
            const results = await queryClass.SELECT(table, what, where, options);
            assert.isString(results[0].displayName);
        } catch (err) {
            console.error(err);
            throw err;
        }
    });

    it('SELECT [what] {where}', async () => {
        const table = 'account';
        const what = [ 'id' ];
        const where = { id: 1 };
        const options = {};

        try {
            const results = await queryClass.SELECT(table, what, where, options);
            assert.isNumber(results[0].id);
        } catch (err) {
            console.error(err);
            throw err;
        }
    });

    it('SELECT [what] {where} {options}', async () => {
        const table = 'account';
        const what = [ 'id', 'email' ];
        const where = { id: 1 };
        const options = {
            sortBy: { displayName: 'ASC' },
            limit: 1,
        };

        try {
            const results = await queryClass.SELECT(table, what, where, options);
            assert.isNumber(results[0].id);
            assert.isString(results[0].email);
        } catch (err) {
            console.error(err);
            throw err;
        }
    });

    it('COUNT {where}', async () => {
        const table = 'account';
        const where = { id: 1 };

        try {
            const result = await queryClass.COUNT(table, where);
            assert.isNumber(result);
        } catch (err) {
            console.error(err);
            throw err;
        }
    });

    it('INSERT {payload}', async () => {
        const table = 'account';
        const payload = {
            email: randomHash.hex(20),
            displayName: randomHash.hex(20),
        };
        const duplicates = {};

        try {
            const result = await queryClass.INSERT(table, payload, duplicates);
            assert.isNumber(result);
            insertId = result;
        } catch (err) {
            console.error(err);
            throw err;
        }
    });

    it('INSERT {payload} {duplicates}', async () => {
        const table = 'account';
        const payload = {
            id: insertId,
            email: randomHash.hex(20),
            displayName: randomHash.hex(20),
        };
        const duplicates = { email: randomHash.hex(20) };

        try {
            const result = await queryClass.INSERT(table, payload, duplicates);
            assert.isNumber(result);
        } catch (err) {
            console.error(err);
            throw err;
        }
    });

    it('UPDATE {payload} {where}', async () => {
        const table = 'account';
        const payload = {
            nameFirst: randomHash.hex(20),
            nameLast: randomHash.hex(20),
            country: randomHash.hex(20),
        };
        const where = { id: insertId };

        try {
            const result = await queryClass.UPDATE(table, payload, where);
            assert.isNumber(result);
        } catch (err) {
            console.error(err);
            throw err;
        }
    });

    it('UPDATE {updated} {where}', async () => {
        const table = 'account';
        const payload = {};
        const where = { id: insertId };

        try {
            const result = await queryClass.UPDATE(table, payload, where);
            assert.isNumber(result);
        } catch (err) {
            console.error(err);
            throw err;
        }
    });

    it('HIDE {where}', async () => {
        const table = 'account';
        const where = { id: insertId };

        try {
            const result = await queryClass.HIDE(table, where);
            assert.isNumber(result);
        } catch (err) {
            console.error(err);
            throw err;
        }
    });

    it('DELETE {where}', async () => {
        const table = 'account';
        const where = { id: insertId };

        try {
            const result = await queryClass.DELETE(table, where);
            assert.isNumber(result);
        } catch (err) {
            console.error(err);
            throw err;
        }
    });
});
