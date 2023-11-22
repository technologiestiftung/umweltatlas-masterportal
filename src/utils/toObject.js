/**
 * Converts lists into objects
 * @param {Array} list to be converted
 * @param {Array} values the corresponding values of parallel array
 * @returns {Object} result
 */
export default function toObject (list, values) {
    const result = {};

    for (let i = 0, length = list.length; i < length; i++) {
        if (values) {
            result[list[i]] = values[i];
        }
        else {
            result[list[i][0]] = list[i][1];
        }
    }
    return result;
}
