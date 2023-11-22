import wfs from "@masterportal/masterportalapi/src/layer/wfs";
import getProxyUrl from "../../../../utils/getProxyUrl";
/**
 * Prepares the possible feature properties to be set for
 * a DescribeFeatureType request and joins this together
 * with the gfiAttributes configuration of the layer.
 *
 * @param {TransactionLayer} layer Layer to retrieve information for.
 * @param {Boolean} useProxy Whether a proxy should be used for requests. Deprecated in v3.0.0.
 * @returns {FeatureProperty[]} If layer.gfiAttributes !== "ignore", then an array of prepared feature properties; else and empty array.
 */
async function prepareFeatureProperties (layer, useProxy) {
    if (layer.gfiAttributes === "ignore") {
        return [];
    }
    const url = useProxy ? getProxyUrl(layer.url) : layer.url;
    let properties;

    try {
        properties = await wfs.receivePossibleProperties(url, layer.version, layer.featureType, layer.isSecured);
    }
    catch (e) {
        console.error(e);
    }

    if (!properties) {
        return [];
    }

    return layer.gfiAttributes === "showAll"
        ? properties
        : properties
            .reduce((array, property) => layer.gfiAttributes[property.key] !== undefined
                ? [...array, {...property, label: layer.gfiAttributes[property.key]}]
                : array,
            [properties.find(({type}) => type === "geometry")]);
}

export default {prepareFeatureProperties};
