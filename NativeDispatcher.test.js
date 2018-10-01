/* eslint-env node, mocha, jest */
import NativeDispatcher from './NativeDispatcher';

let nativeApiRootObj;
let nativeDispatcher;

// set for better visual hint on tests
const wdcBridgeApiPrefix = 'WDCBridge_Api';

let publicInterfaceMethodsNames = ['abortForAuth', 'abortWithError', 'addCrossOriginException', 'log', 'submit', 'reportProgress'];
let privateInterfaceMethodsNames = ['_initCallback', '_shutdownCallback', '_schemaCallback', '_tableDataCallback', '_dataDoneCallback'];

// use if required for debugging
let consoleLog = console.log; // eslint-disable-line no-unused-vars
console.log = jest.fn();

beforeEach(() => {

    nativeApiRootObj = {
        [`${wdcBridgeApiPrefix}_abortForAuth`]: { api: jest.fn() },
        [`${wdcBridgeApiPrefix}_abortWithError`]: { api: jest.fn() },
        [`${wdcBridgeApiPrefix}_addCrossOriginException`]: { api: jest.fn() },
        [`${wdcBridgeApiPrefix}_log`]: { api: jest.fn() },
        [`${wdcBridgeApiPrefix}_submit`]: { api: jest.fn() },
        [`${wdcBridgeApiPrefix}_initCallback`]: { api: jest.fn() },
        [`${wdcBridgeApiPrefix}_shutdownCallback`]: { api: jest.fn() },
        [`${wdcBridgeApiPrefix}_schemaCallbackEx`]: { api: jest.fn() },
        [`${wdcBridgeApiPrefix}_schemaCallback`]: { api: jest.fn() },
        [`${wdcBridgeApiPrefix}_tableDataCallback`]: { api: jest.fn() },
        [`${wdcBridgeApiPrefix}_reportProgress`]: { api: jest.fn() },
        [`${wdcBridgeApiPrefix}_dataDoneCallback`]: { api: jest.fn() }
    };

    nativeDispatcher = new NativeDispatcher(nativeApiRootObj);
});

describe('UNIT - NativeDispatcher', () => {

    it('NativeDispatcher should initPublicInterface and initPrivateInterface correctly upon instantiation', () => {

        expect(nativeDispatcher).toBeInstanceOf(NativeDispatcher);

        // all public interface methods were created
        expect(Object.keys(nativeDispatcher.publicInterface)).toEqual(publicInterfaceMethodsNames);

        for (let methodName of publicInterfaceMethodsNames) {
            expect(typeof nativeDispatcher.publicInterface[methodName]).toBe('function');
        }

        // all private interface methods were created
        expect(Object.keys(nativeDispatcher.privateInterface)).toEqual(privateInterfaceMethodsNames);

        for (let methodName of privateInterfaceMethodsNames) {
            expect(typeof nativeDispatcher.privateInterface[methodName]).toBe('function');
        }

        // initial state values were set
        expect(nativeDispatcher._submitCalled).toBe(false);
        expect(nativeDispatcher._initCallbackCalled).toBe(false);
        expect(nativeDispatcher._shutdownCallbackCalled).toBe(false);

    });

    it('_abortForAuth to call WDCBridge_Api_***.api with the correct arguments values', () => {

        nativeDispatcher._abortForAuth('01');
        expect(nativeApiRootObj[`${wdcBridgeApiPrefix}_abortForAuth`].api).not.toBeCalledWith('011');
        expect(nativeApiRootObj[`${wdcBridgeApiPrefix}_abortForAuth`].api).toBeCalledWith('01');
    });

    it('_abortWithError to call WDCBridge_Api_***.api with the correct arguments values', () => {

        nativeDispatcher._abortWithError('02');
        expect(nativeApiRootObj[`${wdcBridgeApiPrefix}_abortWithError`].api).not.toBeCalledWith('022');
        expect(nativeApiRootObj[`${wdcBridgeApiPrefix}_abortWithError`].api).toBeCalledWith('02');
    });

    it('_addCrossOriginException to call WDCBridge_Api_***.api with the correct arguments values', () => {
        let list = [1, 2, 3];

        nativeDispatcher._addCrossOriginException(list);
        expect(nativeApiRootObj[`${wdcBridgeApiPrefix}_addCrossOriginException`].api).not.toBeCalledWith([]);
        expect(nativeApiRootObj[`${wdcBridgeApiPrefix}_addCrossOriginException`].api).toBeCalledWith(list);
    });

    it('_log to call WDCBridge_Api_***.api with the correct arguments values', () => {

        nativeDispatcher._log(5);
        expect(nativeApiRootObj[`${wdcBridgeApiPrefix}_log`].api).not.toBeCalledWith(6);
        expect(nativeApiRootObj[`${wdcBridgeApiPrefix}_log`].api).toBeCalledWith(5);
    });

    it('_submit to call WDCBridge_Api_***.api just once', () => {

        expect(nativeDispatcher._submitCalled).toBe(false);

        nativeDispatcher._submit();
        expect(nativeApiRootObj[`${wdcBridgeApiPrefix}_submit`].api).toBeCalled();

        expect(nativeDispatcher._submitCalled).toBe(true);

        expect(nativeDispatcher._submit()).toBeUndefined();
        // check if message was logged
        expect(console.log).toBeCalledWith('submit called more than once');
        // check WDCBridge_Api_submit wasn't called twice
        expect(nativeApiRootObj[`${wdcBridgeApiPrefix}_submit`].api.mock.calls.length).toBe(1);

    });

    it('_initCallback to call WDCBridge_Api_***.api  just once', () => {

        expect(nativeDispatcher._initCallbackCalled).toBe(false);

        nativeDispatcher._initCallback();
        expect(nativeApiRootObj[`${wdcBridgeApiPrefix}_initCallback`].api).toBeCalled();

        expect(nativeDispatcher._initCallbackCalled).toBe(true);

        expect(nativeDispatcher._initCallback()).toBeUndefined();
        // check if message was logged
        expect(console.log).toBeCalledWith('initCallback called more than once');
        // check WDCBridge_Api_initCallback wasn't called twice
        expect(nativeApiRootObj[`${wdcBridgeApiPrefix}_initCallback`].api.mock.calls.length).toBe(1);

    });

    it('_shutdownCallback to call WDCBridge_Api_***.api  just once', () => {

        expect(nativeDispatcher._shutdownCallbackCalled).toBe(false);

        nativeDispatcher._shutdownCallback();
        expect(nativeApiRootObj[`${wdcBridgeApiPrefix}_shutdownCallback`].api).toBeCalled();

        expect(nativeDispatcher._shutdownCallbackCalled).toBe(true);

        expect(nativeDispatcher._shutdownCallback()).toBeUndefined();
        // check if message was logged
        expect(console.log).toBeCalledWith('shutdownCallback called more than once');
        // check WDCBridge_Api_shutdownCallback wasn't called twice
        expect(nativeApiRootObj[`${wdcBridgeApiPrefix}_shutdownCallback`].api.mock.calls.length).toBe(1);

    });

    it('_schemaCallback to call WDCBridge_Api_schemaCallbackEx.api with the correct arguments values', () => {
        let schema = { prop: 1 };
        let standardConnections = [2];

        nativeDispatcher._schemaCallback(schema, standardConnections);
        expect(nativeApiRootObj[`${wdcBridgeApiPrefix}_schemaCallbackEx`].api).not.toBeCalledWith({}, []);
        expect(nativeApiRootObj[`${wdcBridgeApiPrefix}_schemaCallbackEx`].api).toBeCalledWith(schema, standardConnections);
    });

    it('_schemaCallback to fallback to WDCBridge_Api_schemaCallback with only schema if WDCBridge_Api_schemaCallbackEx is not defined', () => {
        let schema = { prop: 1 };
        let standardConnections = [2];

        nativeApiRootObj[`${wdcBridgeApiPrefix}_schemaCallbackEx`] = null;

        nativeDispatcher._schemaCallback(schema, standardConnections);
        expect(nativeApiRootObj[`${wdcBridgeApiPrefix}_schemaCallback`].api).not.toBeCalledWith({}, []);
        expect(nativeApiRootObj[`${wdcBridgeApiPrefix}_schemaCallback`].api).not.toBeCalledWith(schema, standardConnections);
        expect(nativeApiRootObj[`${wdcBridgeApiPrefix}_schemaCallback`].api).toBeCalledWith(schema);
    });

    it('_tableDataCallback to call WDCBridge_Api_***.api with the correct arguments values', () => {
        let tableName = 'Sample';
        let data = [2];

        nativeDispatcher._tableDataCallback(tableName, data);
        expect(nativeApiRootObj[`${wdcBridgeApiPrefix}_tableDataCallback`].api).not.toBeCalledWith('', []);
        expect(nativeApiRootObj[`${wdcBridgeApiPrefix}_tableDataCallback`].api).toBeCalledWith(tableName, data);
    });

    it('_reportProgress to call WDCBridge_Api_***.api if available', () => {
        let progress = 'Sample progress string';

        nativeDispatcher._reportProgress(progress);
        expect(nativeApiRootObj[`${wdcBridgeApiPrefix}_reportProgress`].api).not.toBeCalledWith('blabla');
        expect(nativeApiRootObj[`${wdcBridgeApiPrefix}_reportProgress`].api).toBeCalledWith(progress);
    });

    it('_reportProgress to log message if WDCBridge_Api_reportProgress.api is not defined', () => {
        let progress = 'Sample progress string';

        nativeApiRootObj[`${wdcBridgeApiPrefix}_reportProgress`] = null;

        nativeDispatcher._reportProgress(progress);
        // check if message was logged
        expect(console.log).toBeCalledWith('reportProgress not available from this Tableau version');
    });

    it('_dataDoneCallback to call WDCBridge_Api_***.api', () => {

        nativeDispatcher._dataDoneCallback();
        expect(nativeApiRootObj[`${wdcBridgeApiPrefix}_dataDoneCallback`].api).toBeCalled();

    });
});
