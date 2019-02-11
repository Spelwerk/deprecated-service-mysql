const Query = require('./Query');

module.exports = class Association {
    /**
     * @constructor
     * @param {object} pool
     * @param {object} schema
     */
    constructor(pool, schema) {
        this.Query = new Query(pool, schema);
    }

    /**
     * @param {string} table
     * @param {string} association
     * @param {number} tableId
     * @param {number} associationId
     */
    async INSERT(table, association, tableId, associationId) {
        tableId = parseInt(tableId);
        associationId = parseInt(associationId);

        const table_is_association = `${table}_is_${association}`;
        const table_id = `${table}_id`;
        const association_id = `${association}_id`;

        await this.Query.INSERT(table_is_association, { [table_id]: tableId, [association_id]: associationId }, { [association_id]: associationId });
        await this.Query.UPDATE(table, {}, { id: tableId });
    }

    /**
     * @param {string} table
     * @param {string} association
     * @param {number} tableId
     * @param {number} associationId
     */
    async DELETE(table, association, tableId, associationId) {
        tableId = parseInt(tableId);
        associationId = parseInt(associationId);

        const table_is_association = `${table}_is_${association}`;
        const table_id = `${table}_id`;
        const association_id = `${association}_id`;

        await this.Query.DELETE(table_is_association, { [table_id]: tableId, [association_id]: associationId });
        await this.Query.UPDATE(table, {}, { id: tableId });
    }
};
