/**
 * Checks if value is an empty object or collection.
 * @param {Object} obj the object to be checked
 * @returns {boolean} true or false
 */
export default function isEmpty (obj) {
    return [Object, Array].includes((obj || {}).constructor) && !Object.entries(obj || {}).length;
}
