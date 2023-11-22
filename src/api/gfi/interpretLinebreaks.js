
/**
 * Translates CR/LF to Masterportal GFI style newlines.
 * @param {Object} properties an object representing properties
 * @returns {Object} the modified object
 */
export function interpretLinebreaks (properties) {
    if (typeof properties !== "object" || properties === null) {
        return properties;
    }
    return Object.fromEntries(
        Object
            .entries(properties)
            .map(([key, value]) => [
                key,
                typeof value === "string"
                    ? value.replace(/(?:\r\n|\r|\n)/g, "|")
                    : value
            ])
    );
}
