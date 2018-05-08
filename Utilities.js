export function copyFunctions (src, dest) {
    for (var key in src) {
        if (typeof src[key] === 'function') {
            dest[key] = src[key];
        }
    }
}
