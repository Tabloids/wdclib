/* eslint-env node, mocha, jest */
import Table from './Table';

// use if required for debugging
let consoleLog = console.log; // eslint-disable-line no-unused-vars
let consoleWarn = console.warn; // eslint-disable-line no-unused-vars
console.log = jest.fn();
console.warn = jest.fn();

describe('UNIT - Table', () => {

    it('Table should initialize with documented DEFAULTS', () => {
        let table = new Table();

        expect(table.tableInfo).toBeUndefined();

        expect(table.incrementValue).toBe('');

        expect(table.isJoinFiltered).toBe(false);

        expect(table.filterColumnId).toBe('');

        expect(table.filterValues).toEqual([]);

        expect(table._dataCallbackFn).toBeUndefined();

    });

    it('Table should initialize with assigned initialization values', () => {
        let tableInfo = {};
        let incrementValue = '3';
        let isJoinFiltered = true;
        let filterColumnId = '5';
        let filterValues = [2, 3, 5, 7, 11, 13, 17, 19, 23];
        let dataCallbackFn = function dataCallbackFnTest () {
            // this is a test, the param is passed by reference
        };
        let table = new Table(tableInfo, incrementValue, isJoinFiltered, filterColumnId, filterValues, dataCallbackFn);

        expect(table.tableInfo).toBe(tableInfo);

        expect(table.incrementValue).toBe(incrementValue);

        expect(table.isJoinFiltered).toBe(isJoinFiltered);

        expect(table.filterColumnId).toBe(filterColumnId);

        expect(table.filterValues).toBe(filterValues);

        expect(table._dataCallbackFn).toBe(dataCallbackFn);

    });

    it('_appendRows should return boolean "execution success"', () => {
        let table = new Table({}, '', false, '', [], () => { });

        expect(table._appendRows()).toBe(false);

        expect(table._appendRows({})).toBe(false);

        expect(table._appendRows([])).toBe(true);

    });

    it('_appendRows should call _dataCallbackFn on input success"', () => {
        let mockCallback = jest.fn();

        let table = new Table({}, '', false, '', [], mockCallback);

        table._appendRows([]);
        table._appendRows([]);

        expect(mockCallback.mock.calls.length).toBe(2);

    });
});
