import { version as BUILD_NUMBER } from '../package.json';
export let WDC_LIB_PREFIX = 'tableauwdc-';

/**
 *
 */
export class VersionNumber {
    /**
     *
     * @param {String} versionString
     */
    constructor (versionString) {
        let components = versionString.split('.');

        if (components.length < 3) {
            console.log();
            throw new Error(`Invalid number of components. versionString was  ${versionString} `);
        }

        this.major = parseInt(components[0]).toString();
        this.minor = parseInt(components[1]).toString();
        this.patch = parseInt(components[2]).toString();
    }

    /**
     * @returns {String}
     */
    toString () {
        return `${this.major}.${this.minor}.${this.patch}`;
    }

    /**
     *
     * @param {{
     *          major: (String),
     *          minor: (String),
     *          patch: (String)
     *         }}  version Input version to compare against this.version
     *
     * @returns {Number}
     */
    compare ({ major, minor, patch } = {}) {
        let majorDiff = this.major - major;
        let minorDiff = this.minor - minor;
        let patchDiff = this.patch - patch;

        if (majorDiff !== 0) {
            return majorDiff;
        }

        if (minorDiff !== 0) {
            return minorDiff;
        }

        if (patchDiff !== 0) {
            return patchDiff;
        }

        return 0;
    }
}

/**
 *
 * @param {Object} config
 * @returns {String}
 */
export function getBuildNumber ({ showLog = false } = {}) {
    // Single source of truth for version is package json
    // which is stored at the top as BUILD_NUMBER constant

    if (!BUILD_NUMBER) {
        throw new Error(`Unable to retrieve version number from package.json`);
    }

    if (showLog) {
        console.log(`Found versionNumber in package.json: ${BUILD_NUMBER}`);
    }

    return BUILD_NUMBER;
}
