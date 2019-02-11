/* eslint-disable global-require */

process.env.NODE_ENV = 'development';

const { describe } = require('mocha');

describe('Service', () => {
    require('./main/index');
});

describe('Internal Utilities', () => {
    require('./utils/queryUtils');
    require('./utils/tableDataUtils');
    require('./utils/tableSchemaUtils');
});

describe('Classes', () => {
    require('./classes/Connection');
    require('./classes/Query');
    require('./classes/Association');
    require('./classes/Relation');
});
