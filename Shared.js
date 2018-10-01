
import { applyEnums } from './Enums';
import Table from './Table';

/**
* This class represents the shared parts of the javascript
* library which do not have any dependence on whether we are running in
* the simulator, in Tableau, or anywhere else
*/
class Shared {

    /**
     *
     * @param {Object} tableauApiObj - The already created tableau API object (usually window.tableau)
     * @param {Object} privateApiObj - The already created private API object (usually window._tableau)
     * @param {Object} globalObj - The global object to attach things to (usually window)
     */
    constructor (tableauApiObj, privateApiObj, globalObj) {
        this.privateApiObj = privateApiObj;
        this.globalObj = globalObj;
        this._hasAlreadyThrownErrorSoDontThrowAgain = false;

        this.changeTableauApiObj(tableauApiObj);
    }

    /**
     * @returns {Undefined}
     */
    init () {
        console.log('Initializing shared WDC');

        this.globalObj.onerror = this._errorHandler.bind(this);

        // Initialize the functions which will be invoked by the native code
        this._initTriggerFunctions();

        // Assign the deprecated functions which aren't availible in this version of the API
        this._initDeprecatedFunctions();
    }

    /**
     *
     * @param {Object} tableauApiObj
     * @returns {Undefined}
     */
    changeTableauApiObj (tableauApiObj) {
        this.tableauApiObj = tableauApiObj;

        // Assign our make & register functions right away because a connector can use
        // them immediately, even before bootstrapping has completed
        this.tableauApiObj.makeConnector = this._makeConnector.bind(this);
        this.tableauApiObj.registerConnector = this._registerConnector.bind(this);

        applyEnums(this.tableauApiObj);
    }

    /**
     *
     * @param {String} message
     * @param {String} file
     * @param {String} line
     * @param {String} column
     * @param {Object} errorObj
     * @returns {Boolean}
     */
    _errorHandler (message, file, line, column, errorObj) {
        // print error for debugging in the browser
        console.error(errorObj);

        if (this._hasAlreadyThrownErrorSoDontThrowAgain) {
            console.log('Error already thrown');
            return true;
        }

        let msg = message;

        if (errorObj) {
            msg += '   stack:' + errorObj.stack;
        } else {
            msg += '   file: ' + file;
            msg += '   line: ' + line;
        }

        if (this.tableauApiObj && this.tableauApiObj.abortWithError) {
            this.tableauApiObj.abortWithError(msg);
        } else {
            throw msg;
        }

        this._hasAlreadyThrownErrorSoDontThrowAgain = true;

        return true;
    }

    /**
     * @returns {Object}
     */
    _makeConnector () {

        let defaultImpls = {
            init: function (cb) { cb(); },
            shutdown: function (cb) { cb(); }
        };

        return defaultImpls;
    }

    /**
     *
     * @param {Object} wdc
     * @returns {Undefined}
     */
    _registerConnector (wdc) {
        // do some error checking on the wdc
        const FUNCTION_NAMES = ['init', 'shutdown', 'getSchema', 'getData'];

        for (let ii = FUNCTION_NAMES.length - 1; ii >= 0; ii--) {
            if (typeof (wdc[FUNCTION_NAMES[ii]]) !== 'function') {
                throw new Error(`The connector did not define the required function: ${FUNCTION_NAMES[ii]}`);
            }
        }

        console.log('Connector registered');

        this.globalObj._wdc = wdc;
        this._wdc = wdc;
    }

    /**
     * @returns {Undefined}
     */
    _initTriggerFunctions () {
        this.privateApiObj.triggerInitialization = this._triggerInitialization.bind(this);
        this.privateApiObj.triggerSchemaGathering = this._triggerSchemaGathering.bind(this);
        this.privateApiObj.triggerDataGathering = this._triggerDataGathering.bind(this);
        this.privateApiObj.triggerShutdown = this._triggerShutdown.bind(this);
    }

    /**
     * Starts the WDC
     * @returns {Undefined}
     */
    _triggerInitialization () {
        this._wdc.init(this.privateApiObj._initCallback);
    }

    /**
     * Starts the schema gathering process
     * @returns {Undefined}
     */
    _triggerSchemaGathering () {
        this._wdc.getSchema(this.privateApiObj._schemaCallback);
    }

    /**
     * Starts the data gathering process
     * @param {Array} tablesAndIncrementValues
     * @returns {undefined}
     */
    _triggerDataGathering (tablesAndIncrementValues) {

        if (tablesAndIncrementValues.length !== 1) {
            throw new Error(`Unexpected number of tables specified. Expected 1, actual  ${tablesAndIncrementValues.length}`);
        }

        let tableAndIncrementValue = tablesAndIncrementValues[0];
        let isJoinFiltered = !!tableAndIncrementValue.filterColumnId;

        let table = new Table(
            tableAndIncrementValue.tableInfo,
            tableAndIncrementValue.incrementValue,
            isJoinFiltered,
            tableAndIncrementValue.filterColumnId,
            tableAndIncrementValue.filterValues,
            this.privateApiObj._tableDataCallback
        );

        this._wdc.getData(table, this.privateApiObj._dataDoneCallback);
    }

    /**
     * Tells the WDC it's time to shut down
     * @returns {Undefined}
     */
    _triggerShutdown () {
        this._wdc.shutdown(this.privateApiObj._shutdownCallback);
    }

    /**
     * Initializes a series of global callbacks which have been deprecated in version 2.0.0
     * @returns {Undefined}
     */
    _initDeprecatedFunctions () {
        this.tableauApiObj.initCallback = this._initCallback.bind(this);
        this.tableauApiObj.headersCallback = this._headersCallback.bind(this);
        this.tableauApiObj.dataCallback = this._dataCallback.bind(this);
        this.tableauApiObj.shutdownCallback = this._shutdownCallback.bind(this);
    }

    /**
     * @deprecated Since v2.0.0
     *
     * @returns {Undefined}
     */
    _initCallback () {
        this.tableauApiObj.abortWithError('tableau.initCallback has been deprecated in version 2.0.0. Please use the callback function passed to init');
    }

    /**
     * @deprecated Since v2.0.0
     *
     * @param {Array} fieldNames
     * @param {Array} types
     * @returns {Undefined}
     */
    _headersCallback (fieldNames, types) { // eslint-disable-line no-unused-vars
        this.tableauApiObj.abortWithError('tableau.headersCallback has been deprecated in version 2.0.0');
    }

    /**
     * @deprecated Since v2.0.0
     *
     * @param {*} data
     * @param {*} lastRecordToken
     * @param {*} moreData
     * @returns {Undefined}
     */
    _dataCallback (data, lastRecordToken, moreData = null) { // eslint-disable-line no-unused-vars
        this.tableauApiObj.abortWithError('tableau.dataCallback has been deprecated in version 2.0.0');
    }

    /**
     * @deprecated Since v2.0.0
     *
     * @returns {Undefined}
     */
    _shutdownCallback () {
        this.tableauApiObj.abortWithError('tableau.shutdownCallback has been deprecated in version 2.0.0. Please use the callback function passed to shutdown');
    }
}

export default Shared;
