const { describe, it } = require('mocha');
const { assert } = require('chai');
const MySQLService = require('../../src/main');

describe('Main Service', () => {
    it('index', () => {
        assert.isFunction(MySQLService.Association);
        assert.isFunction(MySQLService.Connection);
        assert.isFunction(MySQLService.Query);
        assert.isFunction(MySQLService.Relation);
    });
});
