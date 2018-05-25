/**
 * WARNING - copies are BY REFERENCE
 *
 * @param {Object} src Source Object
 * @param {Object} dest Target Object
 *
 * @returns {Undefined}
 */
export function copyFunctions (src, dest) {

    for (let key in src) {
        if (typeof src[key] === 'function') {
            dest[key] = src[key];
        }
    }

}
