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
     * @param {Object} other
     * @returns {Number}
     */
    compare (other) {
        let majorDiff = this.major - other.major;
        let minorDiff = this.minor - other.minor;
        let fixDiff = this.patch - other.fix;

        if (majorDiff !== 0) {
            return majorDiff;
        }

        if (minorDiff !== 0) {
            return minorDiff;
        }

        if (fixDiff !== 0) {
            return fixDiff;
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
    // Grab the version number from the package json property ( one static source of truth )

    if (!BUILD_NUMBER) {
        throw new Error(`Unable to retrieve version number from package.json`);
    }

    if (showLog) {
        console.log(`Found versionNumber in package.json: ${BUILD_NUMBER}`);
    }

    return BUILD_NUMBER;
}
