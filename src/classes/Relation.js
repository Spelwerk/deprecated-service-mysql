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
     * @public
     * @param {string} table
     * @param {string} relation
     * @param {number} tableId
     * @param {number} relationId
     * @param {object} payload
     */
    async INSERT(table, relation, tableId, relationId, payload) {
        tableId = parseInt(tableId);
        relationId = parseInt(relationId);

        const table_has_relation = `${table}_has_${relation}`;
        const table_id = `${table}_id`;
        const relation_id = `${relation}_id`;

        await this.Query.INSERT(table_has_relation, { [table_id]: tableId, [relation_id]: relationId, ...payload }, { [relation_id]: relationId, ...payload });
        await this.Query.UPDATE(table, {}, { id: tableId });
    }

    /**
     * @public
     * @param {string} table
     * @param {string} relation
     * @param {number} tableId
     * @param {number} relationId
     * @param {object} payload
     */
    async UPDATE(table, relation, tableId, relationId, payload) {
        tableId = parseInt(tableId);
        relationId = parseInt(relationId);

        const table_has_relation = `${table}_has_${relation}`;
        const table_id = `${table}_id`;
        const relation_id = `${relation}_id`;

        await this.Query.UPDATE(table_has_relation, { ...payload }, { [table_id]: tableId, [relation_id]: relationId });
        await this.Query.UPDATE(table, {}, { id: tableId });
    }

    /**
     * @public
     * @param {string} table
     * @param {string} relation
     * @param {number} tableId
     * @param {number} relationId
     */
    async DELETE(table, relation, tableId, relationId) {
        tableId = parseInt(tableId);
        relationId = parseInt(relationId);

        const table_has_relation = `${table}_has_${relation}`;
        const table_id = `${table}_id`;
        const relation_id = `${relation}_id`;

        await this.Query.DELETE(table_has_relation, { [table_id]: tableId, [relation_id]: relationId });
        await this.Query.UPDATE(table, {}, { id: tableId });
    }
};
