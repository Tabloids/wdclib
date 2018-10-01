/**
 *
 */
class Table {

    /**
     * Represents a single table which Tableau has requeste
     *
     * @param {Object} tableInfo Information about the table which has been requested.
     * This is guaranteed to be one of the tables the connector returned in the call to getSchema.
     *
     * @param {string=} incrementValue Defines the incremental update value for this table.
     * Empty string if there is not an incremental update requested.
     *
     * @param {Boolean=} isJoinFiltered Whether or not this table is meant to be filtered using filterValues.
     * @param {String=} filterColumnId If this table is filtered, this is the column where the filter values should be found.
     * @param {Array} filterValues An array of strings which specifies the values we want to retrieve.
     * For example, if an ID column was the filter column, this would be a collection of IDs to retrieve.
     *
     * @param {Function} dataCallbackFn
     */
    constructor (tableInfo, incrementValue = '', isJoinFiltered = false, filterColumnId = '', filterValues = [], dataCallbackFn) {

        this.tableInfo = tableInfo;

        this.incrementValue = incrementValue;

        this.isJoinFiltered = isJoinFiltered;

        this.filterColumnId = filterColumnId;

        this.filterValues = filterValues;

        this._dataCallbackFn = dataCallbackFn; // privacy by dangling underscore

        // bind the public facing version of this function so it can be passed around
        this.appendRows = this._appendRows.bind(this);
    }

    /**
     * Appends the given rows to the set of data contained in this table
     *
     * @param {Array} data - Either an array of arrays or an array of objects which represent the individual rows of data to append to this table
     *
     * @returns {Boolean}
     */
    _appendRows (data) {
        // note: add boolean return for testing purpose

        // Do some quick validation that this data is the format we expect
        // is this validation enough? shouldn't we throw an error? (Jax)
        if (!data) {
            console.warn('rows data is null or undefined');

            return false;
        }

        if (!Array.isArray(data)) {
            // Log a warning because the data is not an array like we expected
            // is this validation enough? shouldn't we throw an error? (Jax)
            console.warn('Table.appendRows must take an array of arrays or array of objects');
            return false;
        }

        // Call back with the rows for this table
        this._dataCallbackFn(this.tableInfo.id, data);

        return true;
    }

}

export default Table;
