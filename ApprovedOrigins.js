import * as Cookies from 'cookies-js';

const SEPARATOR = ',';
export const APPROVED_ORIGINS_KEY = 'wdc_approved_origins';
// alias of Cookies for testing ( and for future replacement? )
export let CookiesLib = Cookies;

/**
 * @returns {*}
 */
function _getApprovedOriginsValue () {
    let result = CookiesLib.get(APPROVED_ORIGINS_KEY);

    return result;
}

/**
 *
 * @param {Array<String>} originArray
 * @returns {*}
 */
function _saveApprovedOrigins (originArray) {

    const APPROVED_ORIGINS = originArray.join(SEPARATOR);

    console.log(`Saving approved origins  ${APPROVED_ORIGINS} `);

    // We could potentially make this a longer term cookie instead of just for the current session
    let result = CookiesLib.set(APPROVED_ORIGINS_KEY, APPROVED_ORIGINS);

    return result;
}

/**
 * Adds an approved origin to the list already saved in a session cookie
 * @param {String} origin
 * @returns {Object|Undefined}
 */
export function addApprovedOrigin (origin) {

    if (origin) {
        let origins = getApprovedOrigins();

        origins.push(origin);

        // pass along the output of the private function
        return _saveApprovedOrigins(origins);
    }

}

/**
 * Retrieves the origins which have already been approved by the user
 * @returns {Array<String>}
 */
export function getApprovedOrigins () {

    let originsString = _getApprovedOriginsValue();

    if (!originsString || originsString.length === 0) {
        return [];
    }

    let origins = originsString.split(SEPARATOR);

    return origins;
}
