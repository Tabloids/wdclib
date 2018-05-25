/* globals require */
import * as ApprovedOrigins from './ApprovedOrigins';
import { getBuildNumber } from './DevUtils/BuildNumber';

import deStringsMap from './resources/Shim_lib_resources_de-DE.json';
import enStringsMap from './resources/Shim_lib_resources_en-US.json';
import esStringsMap from './resources/Shim_lib_resources_es-ES.json';
import jaStringsMap from './resources/Shim_lib_resources_ja-JP.json';
import frStringsMap from './resources/Shim_lib_resources_fr-FR.json';
import koStringsMap from './resources/Shim_lib_resources_ko-KR.json';
import ptStringsMap from './resources/Shim_lib_resources_pt-BR.json';
import zhStringsMap from './resources/Shim_lib_resources_zh-CN.json';

// Required for IE & Edge which don't support endsWith
// require('String.prototype.endsWith'); // now using babel-polyfill

const BUILD_NUMBER = getBuildNumber();

/**
 * Used for communicating between the simulator and web data connector. It does
 * this by passing messages between the WDC window and its parent window
 */
class SimulatorDispatcher {

    /**
     *
     * @param {Object} globalObj - the global object to find tableau interfaces as well
     * as register events (usually window)
     */
    constructor (globalObj) {
        this.globalObj = globalObj;

        this._initMessageHandling();
        this._initPublicInterface();
        this._initPrivateInterface();
    }

    /**
     * @returns {Undefined}
     */
    _initMessageHandling () {
        console.log('Initializing message handling');

        this.globalObj.addEventListener('message', this._receiveMessage.bind(this), false);
        this.globalObj.document.addEventListener('DOMContentLoaded', this._onDomContentLoaded.bind(this));
    }

    /**
     * @returns {Undefined}
     */
    _onDomContentLoaded () {

        // Attempt to notify the simulator window that the WDC has loaded
        if (this.globalObj.parent !== window) {
            this.globalObj.parent.postMessage(this._buildMessagePayload('loaded'), '*');
        }

        if (this.globalObj.opener) {
            // Wrap in try/catch for older versions of IE
            try {
                this.globalObj.opener.postMessage(this._buildMessagePayload('loaded'), '*');
            } catch (e) {
                console.warn('Some versions of IE may not accurately simulate the Web Data Connector. Please retry on a Webkit based browser');
            }
        }

    }

    /**
     * @returns {Object}
     */
    _packagePropertyValues () {
        let propValues = {
            'connectionName': this.globalObj.tableau.connectionName,
            'connectionData': this.globalObj.tableau.connectionData,
            'password': this.globalObj.tableau.password,
            'username': this.globalObj.tableau.username,
            'usernameAlias': this.globalObj.tableau.usernameAlias,
            'incrementalExtractColumn': this.globalObj.tableau.incrementalExtractColumn,
            'versionNumber': this.globalObj.tableau.versionNumber,
            'locale': this.globalObj.tableau.locale,
            'authPurpose': this.globalObj.tableau.authPurpose,
            'platformOS': this.globalObj.tableau.platformOS,
            'platformVersion': this.globalObj.tableau.platformVersion,
            'platformEdition': this.globalObj.tableau.platformEdition,
            'platformBuildNumber': this.globalObj.tableau.platformBuildNumber
        };
        return propValues;
    }

    /**
     *
     * @param {Object} props
     * @returns {Undefined}
     */
    _applyPropertyValues (props) {
        if (props) {
            this.globalObj.tableau.connectionName = props.connectionName;
            this.globalObj.tableau.connectionData = props.connectionData;
            this.globalObj.tableau.password = props.password;
            this.globalObj.tableau.username = props.username;
            this.globalObj.tableau.usernameAlias = props.usernameAlias;
            this.globalObj.tableau.incrementalExtractColumn = props.incrementalExtractColumn;
            this.globalObj.tableau.locale = props.locale;
            this.globalObj.tableau.language = props.locale;
            this.globalObj.tableau.authPurpose = props.authPurpose;
            this.globalObj.tableau.platformOS = props.platformOS;
            this.globalObj.tableau.platformVersion = props.platformVersion;
            this.globalObj.tableau.platformEdition = props.platformEdition;
            this.globalObj.tableau.platformBuildNumber = props.platformBuildNumber;
        }
    }

    /**
     *
     * @param {String} msgName
     * @param {String} msgData
     * @param {String} props
     * @returns {String}
     */
    _buildMessagePayload (msgName, msgData, props) {

        let msgObj = { 'msgName': msgName, 'msgData': msgData, 'props': props, 'version': BUILD_NUMBER };

        return JSON.stringify(msgObj);
    }

    /**
     *
     * @param {*} msgName
     * @param {*} msgData
     * @returns {Undefined}
     */
    _sendMessage (msgName, msgData) {

        let messagePayload = this._buildMessagePayload(msgName, msgData, this._packagePropertyValues());

        let wdcHandler;

        try {
            // try to use webkit.messageHandlers but don't fail since we have a fallback
            wdcHandler = this.globalObj.webkit.messageHandlers.wdcHandler;

        } catch (e) {

            // wdcHandler not found on webkit.messageHandlers to post messagePayload
            // we might be on the simulator

        }

        // Check first to see if we have a wdcHandler defined on messageHandlers to post the message to
        if (wdcHandler) {

            wdcHandler.postMessage(messagePayload);

        } else if (!this._sourceWindow) {

            throw new Error('Looks like the WDC is calling a tableau function before tableau.init() has been called.');

        } else {

            // Make sure we only post this info back to the source origin the user approved in _getWebSecurityWarningConfirm
            this._sourceWindow.postMessage(messagePayload, this._sourceOrigin);

        }
    }

    /**
     *
     * @param {String} payloadString
     * @returns {Object|null}
     */
    _getPayloadObj (payloadString) {
        let payload;

        try {

            payload = JSON.parse(payloadString);

        } catch (e) {

            return null;

        }

        return payload;
    }

    /**
     * @returns {Boolean}
     */
    _getWebSecurityWarningConfirm () {

        // Due to cross-origin security issues over https, we may not be able to retrieve _sourceWindow.
        // Use sourceOrigin instead.
        let origin = this._sourceOrigin;
        let Uri = require('jsuri'); // @todo review this
        let parsedOrigin = new Uri(origin);
        let hostName = parsedOrigin.host();

        const SUPPORTED_HOSTS = ['localhost', 'tableau.github.io'];

        if (SUPPORTED_HOSTS.indexOf(hostName) >= 0) {
            return true;
        }

        // Whitelist Tableau domains
        if (hostName && hostName.endsWith('online.tableau.com')) {
            return true;
        }

        let alreadyApprovedOrigins = ApprovedOrigins.getApprovedOrigins();

        if (alreadyApprovedOrigins.indexOf(origin) >= 0) {
            // The user has already approved this origin, no need to ask again
            console.log(`Already approved the origin ${origin} , not asking again`);
            return true;
        }

        let localizedWarningTitle = this._getLocalizedString('webSecurityWarning');
        let completeWarningMsg = localizedWarningTitle + '\n\n' + hostName + '\n';
        let isConfirmed = confirm(completeWarningMsg);

        if (isConfirmed) {
            // Set a session cookie to mark that we've approved this already
            ApprovedOrigins.addApprovedOrigin(origin);
        }

        return isConfirmed;
    }

    /**
     * @returns {String}
     */
    _getCurrentLocale () {
        // Use current browser's locale to get a localized warning message
        let currentBrowserLanguage = (navigator.language || navigator.userLanguage);
        let locale = currentBrowserLanguage ? currentBrowserLanguage.substring(0, 2) : 'en';
        let supportedLocales = ['de', 'en', 'es', 'fr', 'ja', 'ko', 'pt', 'zh']; // can we move this to package json as we did with connectors?

        // Fall back to English for other unsupported lanaguages
        if (supportedLocales.indexOf(locale) < 0) {
            locale = 'en';
        }

        return locale;
    }

    /**
     *
     * @param {String} stringKey
     * @returns {String}
     */
    _getLocalizedString (stringKey) {
        let locale = this._getCurrentLocale();

        // Use static require here, otherwise webpack would generate a much bigger JS file
        // ( the increment in size is irrelevant, specially when minimized, moving to the top and import [JAX])

        // let deStringsMap = require('json-loader!./resources/Shim_lib_resources_de-DE.json');
        // let enStringsMap = require('json-loader!./resources/Shim_lib_resources_en-US.json');
        // let esStringsMap = require('json-loader!./resources/Shim_lib_resources_es-ES.json');
        // let jaStringsMap = require('json-loader!./resources/Shim_lib_resources_ja-JP.json');
        // let frStringsMap = require('json-loader!./resources/Shim_lib_resources_fr-FR.json');
        // let koStringsMap = require('json-loader!./resources/Shim_lib_resources_ko-KR.json');
        // let ptStringsMap = require('json-loader!./resources/Shim_lib_resources_pt-BR.json');
        // let zhStringsMap = require('json-loader!./resources/Shim_lib_resources_zh-CN.json');

        let stringJsonMapByLocale = {
            'de': deStringsMap,
            'en': enStringsMap,
            'es': esStringsMap,
            'fr': frStringsMap,
            'ja': jaStringsMap,
            'ko': koStringsMap,
            'pt': ptStringsMap,
            'zh': zhStringsMap
        };

        let localizedStringsJson = stringJsonMapByLocale[locale];

        return localizedStringsJson[stringKey];
    }

    /**
     *
     * @param {Object} evt
     * @returns {Undefined}
     */
    _receiveMessage (evt) {
        console.log('Received message!');

        let wdc = this.globalObj._wdc;

        if (!wdc) {
            throw new Error('No WDC registered. Did you forget to call tableau.registerConnector?');
        }

        let payloadObj = this._getPayloadObj(evt.data);

        if (!payloadObj) {
            return; // This message is not needed for WDC
        }

        if (!this._sourceWindow) {
            this._sourceWindow = evt.source;
            this._sourceOrigin = evt.origin;
        }

        let msgData = payloadObj.msgData;
        this._applyPropertyValues(payloadObj.props);

        switch (payloadObj.msgName) {
            case 'init':
                // Warn users about possible phinishing attacks
                if (!this._getWebSecurityWarningConfirm()) {
                    window.close();
                } else {
                    this.globalObj.tableau.phase = msgData.phase;
                    this.globalObj._tableau.triggerInitialization();
                }
                break;
            case 'shutdown':
                this.globalObj._tableau.triggerShutdown();
                break;
            case 'getSchema':
                this.globalObj._tableau.triggerSchemaGathering();
                break;
            case 'getData':
                this.globalObj._tableau.triggerDataGathering(msgData.tablesAndIncrementValues);
                break;
        }
    }

    /**
     * PUBLIC INTERFACE
     * @returns {Undefined}
     */
    _initPublicInterface () {
        console.log('Initializing public interface');

        this._submitCalled = false;

        // Assign the public interface to this
        this.publicInterface = {
            abortForAuth: this._abortForAuth.bind(this),
            abortWithError: this._abortWithError.bind(this),
            addCrossOriginException: this._addCrossOriginException.bind(this),
            log: this._log.bind(this),
            reportProgress: this._reportProgress.bind(this),
            submit: this._submit.bind(this)
        };
    }

    /**
     * @see http://tableau.github.io/webdataconnector/docs/api_ref.html#webdataconnectorapi.tableau.abortforauth
     *
     * @param {String} msg
     * @returns {Undefined}
     */
    _abortForAuth (msg) {
        this._sendMessage('abortForAuth', { 'msg': msg });
    }

    /**
     * @see http://tableau.github.io/webdataconnector/docs/api_ref.html#webdataconnectorapi.tableau.abortwitherror
     *
     * @param {String} msg
     * @returns {Undefined}
     */
    _abortWithError (msg) {
        this._sendMessage('abortWithError', { 'errorMsg': msg });
    }

    /**
     * Missing documentation online, we need to add one
     *
     * @param {Array} destOriginList
     * @returns {Undefined}
     */
    _addCrossOriginException (destOriginList) {
        // Don't bother passing this back to the simulator since there's nothing it can
        // do. Just call back to the WDC indicating that it worked
        console.log('Cross Origin Exception requested in the simulator. Pretending to work.');

        // can we return a promise so we can listen for resolution instead of blindly wait?
        setTimeout(function () {
            this.globalObj._wdc.addCrossOriginExceptionCompleted(destOriginList);
        }.bind(this), 0);
    }

    /**
     * @see http://tableau.github.io/webdataconnector/docs/api_ref.html#webdataconnectorapi.tableau.log
     *
     * @param {String} msg
     * @returns {Undefined}
     */
    _log (msg) {
        this._sendMessage('log', { 'logMsg': msg });
    }

    /**
     * @see http://tableau.github.io/webdataconnector/docs/api_ref.html#webdataconnectorapi.tableau.reportProgress
     *
     * @param {String} progressMessage
     * @returns {Undefined}
     */
    _reportProgress (progressMessage) {
        this._sendMessage('reportProgress', { 'progressMsg': progressMessage });
    }

    /**
     * @see http://tableau.github.io/webdataconnector/docs/api_ref.html#webdataconnectorapi.tableau.submit
     *
     * @returns {Undefined}
     */
    _submit () {
        this._sendMessage('submit');
    }

    /**
     * PRIVATE INTERFACE
     * @returns {Undefined}
     */
    _initPrivateInterface () {
        console.log('Initializing private interface');

        // Assign the private interface to this
        this.privateInterface = {
            _initCallback: this._initCallback.bind(this),
            _shutdownCallback: this._shutdownCallback.bind(this),
            _schemaCallback: this._schemaCallback.bind(this),
            _tableDataCallback: this._tableDataCallback.bind(this),
            _dataDoneCallback: this._dataDoneCallback.bind(this)
        };
    }

    /**
     * @see http://tableau.github.io/webdataconnector/docs/api_ref.html#webdataconnectorapi.initcallback
     *
     * @returns {Undefined}
     */
    _initCallback () {
        this._sendMessage('initCallback');
    }

    /**
     * @see http://tableau.github.io/webdataconnector/docs/api_ref.html#webdataconnectorapi.shutdowncallback
     *
     * @returns {Undefined}
     */
    _shutdownCallback () {
        this._sendMessage('shutdownCallback');
    }

    /**
     * @see http://tableau.github.io/webdataconnector/docs/api_ref.html#webdataconnectorapi.schemacallback
     *
     * @param {Array<TableInfo>} schema  TableInfo @see http://tableau.github.io/webdataconnector/docs/api_ref.html#webdataconnectorapi.tableinfo-1
     * @param {Array<StandardConnection>} standardConnections StandardConnection @see http://tableau.github.io/webdataconnector/docs/api_ref.html#webdataconnectorapi.standardconnection
     * @returns {Undefined}
     */
    _schemaCallback (schema, standardConnections = []) {
        this._sendMessage('_schemaCallback', { 'schema': schema, 'standardConnections': standardConnections });
    }
    /**
     *
     * @param {String} tableName
     * @param {*} data
     * @returns {Undefined}
     */
    _tableDataCallback (tableName, data) {
        this._sendMessage('_tableDataCallback', { 'tableName': tableName, 'data': data });
    }

    /**
     * @returns {Undefined}
     */
    _dataDoneCallback () {
        this._sendMessage('_dataDoneCallback');
    }
}

export default SimulatorDispatcher;
