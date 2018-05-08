/* globals process */
import { version as BUILD_NUMBER } from '../package.json';
export let WDC_LIB_PREFIX = 'tableauwdc-';

/**
 * Where is this used? couldn't find anywhere
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
        return `${this.major}${this.minor}.${this.patch}`;
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
 * @returns {String}
 */
export function getBuildNumber () {
    // Grab the version number from the package json property ( one source of truth )
    let versionNumber = BUILD_NUMBER;

    if (versionNumber) {

        console.log(`Found versionNumber in package.json: ${versionNumber}`);

    } else {
        // why? I'd strongly suggest to have only 1 source of truth for versioning, which is the package.json
        versionNumber = process.argv.versionNumber;
        console.log(`Found versionNumber in argument: ${versionNumber}`);

    }

    return versionNumber;
}
