
/**
 * Used for communicating between Tableau desktop/server and the WDC's
 * Javascript. is predominantly a pass-through to the Qt WebBridge methods
 */
class NativeDispatcher {

    /**
     *
     * @param {Object} nativeApiRootObj - The root object where the native Api methods are available.
     * For WebKit, 'this' is window.
     *
     */
    constructor (nativeApiRootObj) {
        this.nativeApiRootObj = nativeApiRootObj;
        this._initPublicInterface();
        this._initPrivateInterface();
    }

    /**
     * @returns {Undefined}
     */
    _initPublicInterface () {

        console.log('Initializing public interface for NativeDispatcher');

        this._submitCalled = false;

        this.publicInterface = {
            abortForAuth: this._abortForAuth.bind(this),
            abortWithError: this._abortWithError.bind(this),
            addCrossOriginException: this._addCrossOriginException.bind(this),
            log: this._log.bind(this),
            psubmit: this._submit.bind(this),
            reportProgress: this._reportProgress.bind(this)
        };

    }

    /**
     *
     * @param {String} msg
     * @returns {Undefined}
     */
    _abortForAuth (msg) {
        this.nativeApiRootObj.WDCBridge_Api_abortForAuth.api(msg);
    }

    /**
     *
     * @param {String} msg
     * @returns {Undefined}
     */
    _abortWithError (msg) {
        this.nativeApiRootObj.WDCBridge_Api_abortWithError.api(msg);
    }

    /**
     *
     * @param {Array} destOriginList
     * @returns {Undefined}
     */
    _addCrossOriginException (destOriginList) {
        this.nativeApiRootObj.WDCBridge_Api_addCrossOriginException.api(destOriginList);
    }

    /**
     *
     * @param {*} msg
     * @returns {Undefined}
     */
    _log (msg) {
        this.nativeApiRootObj.WDCBridge_Api_log.api(msg);
    }

    /**
     * @returns {Undefined}
     */
    _submit () {

        if (this._submitCalled) {
            console.log('submit called more than once');
            return;
        }

        this._submitCalled = true;
        this.nativeApiRootObj.WDCBridge_Api_submit.api();
    }

    /**
     * @returns {Undefined}
     */
    _initPrivateInterface () {
        console.log('Initializing private interface for NativeDispatcher');

        this._initCallbackCalled = false;
        this._shutdownCallbackCalled = false;

        this.privateInterface = {
            _initCallback: this._initCallback.bind(this),
            _shutdownCallback: this._shutdownCallback.bind(this),
            _schemaCallback: this._schemaCallback.bind(this),
            _tableDataCallback: this._tableDataCallback.bind(this),
            _dataDoneCallback: this._dataDoneCallback.bind(this)
        };
    }

    /**
     * @returns {Undefined}
     */
    _initCallback () {

        if (this._initCallbackCalled) {
            console.log('initCallback called more than once');
            return;
        }

        this._initCallbackCalled = true;
        this.nativeApiRootObj.WDCBridge_Api_initCallback.api();
    }

    /**
     * @returns {Undefined}
     */
    _shutdownCallback () {

        if (this._shutdownCallbackCalled) {
            console.log('shutdownCallback called more than once');
            return;
        }

        this._shutdownCallbackCalled = true;
        this.nativeApiRootObj.WDCBridge_Api_shutdownCallback.api();
    }

    /**
     *
     * @param {*} schema
     * @param {Array} standardConnections
     * @returns {Undefined}
     */
    _schemaCallback (schema, standardConnections = []) {

        // Check to make sure we are using a version of desktop which has the WDCBridge_Api_schemaCallbackEx defined
        if (!!this.nativeApiRootObj.WDCBridge_Api_schemaCallbackEx) {

            // Providing standardConnections is optional but we can't pass undefined back because Qt will choke
            this.nativeApiRootObj.WDCBridge_Api_schemaCallbackEx.api(schema, standardConnections);

        } else {
            this.nativeApiRootObj.WDCBridge_Api_schemaCallback.api(schema);
        }
    }

    /**
     *
     * @param {*} tableName
     * @param {*} data
     * @returns {Undefined}
     */
    _tableDataCallback (tableName, data) {
        this.nativeApiRootObj.WDCBridge_Api_tableDataCallback.api(tableName, data);
    }

    /**
     *
     * @param {*} progress
     * @returns {Undefined}
     */
    _reportProgress (progress) {

        // Report progress was added in 2.1 so it may not be available if Tableau only knows 2.0
        if (!!this.nativeApiRootObj.WDCBridge_Api_reportProgress) {

            this.nativeApiRootObj.WDCBridge_Api_reportProgress.api(progress);

        } else {
            console.log('reportProgress not available from this Tableau version');
        }
    }

    /**
     * @returns {Undefined}
     */
    _dataDoneCallback () {
        this.nativeApiRootObj.WDCBridge_Api_dataDoneCallback.api();
    }
}

export default NativeDispatcher;
