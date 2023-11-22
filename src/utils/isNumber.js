/**
 * Checks if the given param is a number.
 * @param {*} value The given param to check.
 * @returns {Boolean} true if the given string is a (decimal) number - false if not.
 */
export default function isNumber (value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
}
