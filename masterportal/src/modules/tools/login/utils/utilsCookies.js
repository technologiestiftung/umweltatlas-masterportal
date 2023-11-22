/**
 * Set a cookie value
 *
 * @param {String} name of cookie to set
 * @param {String} value to set into cookie
 * @param {int} days the cookie is valid
 * @return {void}
 */
export function set (name, value, days) {
    let expires = "";

    if (days) {
        const date = new Date();

        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    const cookie = name + "=" + (value || "") + expires + "; secure; path=/";

    document.cookie = cookie;
}

/**
 * Gets value of cookie
 *
 * @param {String} name of cookie to retrieve
 * @returns {String} cookie value
 */
export function get (name) {
    const nameEQ = name + "=",
        ca = document.cookie.split(";");

    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];

        while (c.charAt(0) === " ") {
            c = c.substring(1, c.length);
        }
        if (c.indexOf(nameEQ) === 0) {
            return c.substring(nameEQ.length, c.length);
        }
    }
    return undefined;
}

/**
 * Delete cookie with given name
 *
 * @param {String} name of cookie to delete
 * @return {void}
 */
export function erase (name) {
    document.cookie = name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
}

/**
 * Delete all cookies with names given in list
 *
 * @param {String[]} names of cookies to delete
 * @return {void}
 */
export function eraseAll (names) {
    names.forEach(name => {
        document.cookie = name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    });
}

export default {
    set,
    get,
    erase,
    eraseAll
};
