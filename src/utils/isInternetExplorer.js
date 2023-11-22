/**
 * Searches the userAgent for the string internet explorer.
 * @return {false|string} Returns false unless IE or string with version for IE9, IE10, IE11.
 */
export default function isInternetExplorer () {
    let ie = false;

    if ((/MSIE 9/i).test(navigator.userAgent)) {
        ie = "IE9";
    }
    else if ((/MSIE 10/i).test(navigator.userAgent)) {
        ie = "IE10";
    }
    else if ((/rv:11.0/i).test(navigator.userAgent)) {
        ie = "IE11";
    }
    return ie;
}
