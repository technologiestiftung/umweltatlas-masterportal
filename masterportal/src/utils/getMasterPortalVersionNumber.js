/**
 * Returns current Master Portal Version Number
 * @returns {string} Masterportal version number
 */
export default function getMasterPortalVersionNumber () {
    return require("../../package.json").version;
}
