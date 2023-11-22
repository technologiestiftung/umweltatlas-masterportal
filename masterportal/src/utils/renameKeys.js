/**
 * replaces the names of object keys with the values provided.
 * @param {object} keysMap - keys mapping object
 * @param {object} obj - the original object
 * @returns {object} the renamed object
 */
export default function renameKeys (keysMap, obj) {
    return Object.keys(obj).reduce((acc, key) => {
        return {
            ...acc,
            ...{[keysMap[key] || key]: obj[key]}
        };
    },
    {});
}
