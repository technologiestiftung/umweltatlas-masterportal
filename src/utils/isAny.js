/**
 * @description returns if the device type is mobile
 * @returns {*} todo
 */
export function isAny () {
    return isAndroid() || isApple() || isOpera() || isWindows();
}

/**
 * Searches the userAgent for the string android.
 * @return {Array|null} Returns an array with the results. Returns zero if nothing is found.
 */
export function isAndroid () {
    return navigator.userAgent.match(/Android/i);
}

/**
 * Searches the userAgent for the string iPhone, iPod or iPad.
 * @return {Array|null} Returns an array with the results. Returns zero if nothing is found.
 */
export function isApple () {
    return navigator.userAgent.match(/iPhone|iPod|iPad/i);
}

/**
 * Searches the userAgent for the string opera.
 * @return {Array|null} Returns an array with the results. Returns zero if nothing is found.
 */
export function isOpera () {
    return navigator.userAgent.match(/Opera Mini/i);
}

/**
 * Searches the userAgent for the string windows.
 * @return {Array|null} Returns an array with the results. Returns zero if nothing is found.
 */
export function isWindows () {
    return navigator.userAgent.match(/IEMobile/i);
}
