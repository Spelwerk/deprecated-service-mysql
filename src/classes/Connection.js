const _ = require('lodash');
const mysql = require('mysql2/promise');
const commonErrors = require('spelwerk-common-errors');

const TableSchemaUtils = require('../utils/tableSchemaUtils');

const { DBSchemaNotFoundError } = commonErrors;

module.exports = class Connection {
    /**
     * @constructor
     * @param {object} config
     * @param {object} fieldTitles
     * @param {array} restrictedFields
     */
    constructor(config, fieldTitles, restrictedFields) {
        this.config = config;
        this.fieldTitles = fieldTitles;
        this.restrictedFields = restrictedFields;
        this.array = [];
        this.schema = {};
    }

    /**
     * @public
     */
    async connect() {
        this.pool = mysql.createPool(this.config);
        await this.setArray();
        await this.setSchema();
    }

    /**
     * @private
     */
    async setArray() {
        this.array = [];

        const query = 'SELECT ' +
            'TABLE_NAME ' +
            'FROM information_schema.tables ' +
            'WHERE table_type = \'BASE TABLE\' AND table_schema = ?';

        const [ rows ] = await this.pool.query(query, [ this.config.database ]);

        _.forEach(rows, (row) => {
            const { TABLE_NAME } = row;
            this.array.push(TABLE_NAME);
        });
    }

    /**
     * @private
     */
    async setSchema() {
        this.schema = {};

        for (const i in this.array) {
            if (!this.array.hasOwnProperty(i)) continue;

            const tableName = this.array[i];

            this.schema[tableName] = await TableSchemaUtils.getTableSchema(
                tableName,
                this.pool,
                this.config.database,
                this.array,
                this.fieldTitles,
                this.restrictedFields
            );
        }
    }

    /**
     * @public
     * @returns {object}
     */
    getPool() {
        return this.pool;
    }

    /**
     * @public
     * @returns {object}
     */
    getSchema() {
        return this.schema;
    }

    /**
     * @public
     * @returns {object}
     */
    getTableSchema(tableName) {
        const tableSchema = this.schema[tableName];

        if (!tableSchema) {
            throw new DBSchemaNotFoundError(tableName);
        }

        return tableSchema;
    }
};
