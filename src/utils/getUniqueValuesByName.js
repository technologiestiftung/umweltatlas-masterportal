/**
 * Gets the unique values for given name.
 * @param {String} attrName The attrName.
 * @param {Object[]} obj An array of objects to iterate.
 * @returns {String[]} The unique values.
*/
export default function getUniqueValuesByName (attrName, obj) {
    if (typeof attrName !== "string" || !Array.isArray(obj) || !obj.length) {
        return [];
    }
    const result = {};

    obj.forEach(val => {
        if (typeof val[attrName] !== "undefined" && !result[val[attrName]]) {
            result[val[attrName]] = true;
        }
    });
    return Object.keys(result);
}
