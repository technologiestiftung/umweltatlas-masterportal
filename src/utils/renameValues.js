/**
 * recursively replaces the names of object values with the values provided.
 * @param {object} valuesMap - values mapping object
 * @param {object} obj - the original object
 * @returns {object} the renamed object
 */
export default function renameValues (valuesMap, obj) {
    return Object.keys(obj).reduce((acc, key) => {
        if (obj[key]) {
            if (obj[key].constructor === Object) {
                return {
                    ...acc,
                    ...{[key]: renameValues(valuesMap, obj[key])}
                };
            }
        }
        return {
            ...acc,
            ...{[key]: valuesMap[obj[key]] || obj[key]}
        };
    },
    {});
}
