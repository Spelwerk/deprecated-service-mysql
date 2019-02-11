const { describe, it } = require('mocha');
const _ = require('lodash');
const { assert } = require('chai');
const queryUtils = require('../../src/utils/queryUtils');

describe('queryUtils', () => {
    it('snakeCaseKeys', () => {
        const input = {
            key: true,
            snake_thing: true,
            snakeKey: true,
        };
        const result = queryUtils.snakeCaseKeys(input);
        assert.isTrue(result.key);
        assert.isTrue(result.snake_thing);
        assert.isTrue(result.snake_key);
    });

    it('isKeyInSchema', () => {
        const schema = { fields: { list: [ 'one', 'two' ] } };

        const result1 = queryUtils.isKeyInSchema('one', schema);
        assert.isTrue(result1);

        const result2 = queryUtils.isKeyInSchema('two', schema);
        assert.isTrue(result2);

        const result3 = queryUtils.isKeyInSchema('thr', schema);
        assert.isFalse(result3);
    });

    it('formatRows', () => {
        const rows = [
            {
                boolean: 1,
                string: 'string',
                nothing: '',
                test__one: 11,
                test__two: 22,
            },
            {
                boolean: 0,
                string: 'string',
                nothing: '',
                test__one: 33,
                test__two: 44,
            },
        ];
        const fields = [
            { name: 'boolean', columnType: 1 },
            { name: 'string', columnType: 2 },
            { name: 'nothing', columnType: 3 },
        ];

        const result = queryUtils.formatRows(rows, fields);

        _.forEach(result, (item) => {
            assert.isBoolean(item.boolean);
            assert.isString(item.string);
            assert.isNull(item.nothing);
            assert.isObject(item.test);
            assert.isNumber(item.test.one);
            assert.isNumber(item.test.two);
        });
    });

});
