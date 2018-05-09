/* globals require, qt */

import { copyFunctions } from './Utilities';
import Shared from './Shared';
import NativeDispatcher from './NativeDispatcher';
import SimulatorDispatcher from './SimulatorDispatcher';
import { getBuildNumber } from './DevUtils/BuildNumber';

let qwebchannel = require('qwebchannel');
const BUILD_NUMBER = getBuildNumber();

/**
 * ShimLibrary - This module defines the WDC's shim library
 * which is used to bridge the gap between the javascript code of the WDC and the driving context
 * of the WDC (Tableau desktop, the simulator, etc.)
 */

/**
 * This function should be called once bootstrapping has been completed and the dispatcher and shared WDC objects are both created and available
 *
 * @param {Object} _dispatcher
 * @param {Object} _shared
 *
 * @returns {Undefined}
 */
function bootstrappingFinished (_dispatcher, _shared) {
    copyFunctions(_dispatcher.publicInterface, window.tableau);
    copyFunctions(_dispatcher.privateInterface, window._tableau);
    _shared.init();
}

/**
 * Check to see if the tableauVersionBootstrap is defined as a global object. If so,
 * we are running in the Tableau desktop/server context. If not, we're running in the simulator
 * @returns {Boolean}
 */
function runningOnTableau () {
    return !!window.tableauVersionBootstrap;
}

/**
 * Initializes the wdc shim library. You must call this before doing anything with WDC
 *
 * @returns {Undefined}
 */
export function init () {

    /**
     * The initial code here is the only place in our module which should have global
     * knowledge of how all the WDC components are glued together. This is the only place
     * which will know about the window object or other global objects. This code will be run
     * immediately when the shim library loads and is responsible for determining the context
     * which it is running it and setup a communications channel between the js & running code
     */

    let dispatcher = null;
    let shared = null;

    // Always define the private _tableau object at the start
    window._tableau = {};

    console.log(`Initializing tableauwdc version number ${BUILD_NUMBER}`);

    /**
     * Check to see if the tableauVersionBootstrap is defined as a global object. If so,
     * we are running in the Tableau desktop/server context. If not, we're running in the simulator
     */
    if (runningOnTableau()) {
        // Running on Tableau
        // We have the tableau object defined
        console.log(`Initializing NativeDispatcher, Reporting version number`);

        window.tableauVersionBootstrap.ReportVersionNumber(BUILD_NUMBER);

        dispatcher = new NativeDispatcher(window);

    } else if (!!window.qt && !!window.qt.webChannelTransport) {
        // qwebchannel
        console.log('Initializing NativeDispatcher for qwebchannel');

        window.tableau = {};

        // We're running in a context where the webChannelTransport is available. This means QWebEngine is in use
        window.channel = new qwebchannel.QWebChannel(qt.webChannelTransport, function (channel) {

            console.log('QWebChannel created successfully');

            /**
             * Define the function which tableau will call after it has inserted all the required objects into the javascript frame
             * @returns {Undefined}
             */
            window._tableau._nativeSetupCompleted = function () {

                // Once the native code tells us everything here is done, we should have all the expected objects inserted into js
                dispatcher = new NativeDispatcher(channel.objects);

                window.tableau = channel.objects.tableau;

                shared.changeTableauApiObj(window.tableau);

                bootstrappingFinished(dispatcher, shared);

            };

            // Actually call into the version bootstrapper to report our version number
            channel.objects.tableauVersionBootstrap.ReportVersionNumber(BUILD_NUMBER);

        });

    } else {
        // Running on Simulator
        console.log('Version Bootstrap is not defined, Initializing SimulatorDispatcher');

        window.tableau = {};

        dispatcher = new SimulatorDispatcher(window);

    }

    // Initialize the shared WDC object and add in our enum values
    shared = new Shared(window.tableau, window._tableau, window);

    /**
     * Check to see if the dispatcher is already defined and immediately call the
     * callback if so
     */
    if (dispatcher) {
        bootstrappingFinished(dispatcher, shared);
    }
}

export default init;
