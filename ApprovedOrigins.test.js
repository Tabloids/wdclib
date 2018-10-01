/* eslint-env node, mocha, jest */
import * as ApprovedOrigins from './ApprovedOrigins';

// use if required for debugging
let consoleLog = console.log; // eslint-disable-line no-unused-vars
console.log = jest.fn();

describe('UNIT - ApprovedOrigins', () => {

    beforeEach(() => {
        // Cookies Mock to make this a Unit Test instead of an integration test
        // temp mock, will investigate on a better mocking for Cookies lib :(
        // (tried with standard jest mock, ridiculously failing)

        ApprovedOrigins.CookiesLib.mokedCookies = {};

        ApprovedOrigins.CookiesLib.get = jest.fn(() => {
            return ApprovedOrigins.CookiesLib.mokedCookies[ApprovedOrigins.APPROVED_ORIGINS_KEY];
        });

        ApprovedOrigins.CookiesLib.set = jest.fn((key, val) => {
            ApprovedOrigins.CookiesLib.mokedCookies[key] = val;

            return ApprovedOrigins.CookiesLib;
        });

    });

    it('getApprovedOrigins should get an empty array if no value is set', () => {
        expect(ApprovedOrigins.getApprovedOrigins()).toEqual([]);
    });

    it('addApprovedOrigin should add an approved origin and ApprovedOrigins.getApprovedOrigins get it correctly', () => {
        let origin = 'http://tableau.com';
        expect(ApprovedOrigins.addApprovedOrigin(origin)).toBe(ApprovedOrigins.CookiesLib);

        expect(ApprovedOrigins.getApprovedOrigins()).toEqual([origin]);

    });

    it('addApprovedOrigin should add multiple values and get an array of the values', () => {
        let origin1 = 'http://tableau.com';
        let origin2 = 'http://connectors.tableab.com';
        ApprovedOrigins.addApprovedOrigin(origin1);
        ApprovedOrigins.addApprovedOrigin(origin2);

        expect(ApprovedOrigins.getApprovedOrigins()).toEqual([origin1, origin2]);

    });
});
