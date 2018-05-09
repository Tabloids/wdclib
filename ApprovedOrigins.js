import * as Cookies from 'cookies-js';

const APPROVED_ORIGINS_KEY = 'wdc_approved_origins';
const SEPARATOR = ',';

/**
 * @returns {*}
 */
function _getApprovedOriginsValue () {
    let result = Cookies.get(APPROVED_ORIGINS_KEY);

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
    let result = Cookies.set(APPROVED_ORIGINS_KEY, APPROVED_ORIGINS);

    return result;
}

/**
 * Adds an approved origins to the list already saved in a session cookie
 * @param {String} origin
 * @returns {Undefined}
 */
export function addApprovedOrigin (origin) {

    if (origin) {
        let origins = getApprovedOrigins();

        origins.push(origin);

        _saveApprovedOrigins(origins);
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
