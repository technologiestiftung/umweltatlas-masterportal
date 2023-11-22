
/**
 * Checks if a value is an html.
 * @param {string} value The value to check.
 * @example ```<tag/>```
 * @returns {boolean} True if the input is an html.
 */
export function isHTML (value) {
    const parser = new DOMParser(),
        doc = parser.parseFromString(value, "text/xml"),
        errorNode = doc.querySelector("parsererror");
    let valid = false;

    if (!errorNode) {
        valid = true;
    }

    return valid;
}

export default {isHTML};
