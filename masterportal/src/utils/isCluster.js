import Feature from "ol/Feature";

/**
 * Checks if features are clustered.
 * @param {ol/Feature} feature - The map feature to check.
 * @returns {Boolean} True if features are clustered.
 */
function isCluster (feature) {
    if (typeof feature !== "object" || feature instanceof Feature === false) {
        console.error(`utils/isCluster: feature must be an ol feature object. Got ${feature} instead`);
        return false;
    }
    return typeof feature.get("features") === "object" && Boolean(feature.get("features"));

}

module.exports = {
    isCluster
};
