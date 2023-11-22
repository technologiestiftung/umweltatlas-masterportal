import isObject from "../../../../utils/isObject.js";
import {SensorThingsHttp} from "../../../../utils/sensorThingsHttp.js";

/**
 * Calls the sta url and collects all properties of the features.
 * @param {String} url The url to the STA.
 * @param {String} rootNode The root node of the sta call.
 * @param {Function} onsuccess A function(Object[], String) to call on success with the properties and namespace of observation type.
 * @param {Function} onerror A function(Error) to call on error.
 * @param {Function|Boolean} [axiosMock=false] false to use axios, a function that is called with the axios configuration if mock is needed.
 * @returns {void}
 */
function fetchAllStaProperties (url, rootNode, onsuccess, onerror, axiosMock = false) {
    const http = new SensorThingsHttp({
            removeIotLinks: true,
            httpClient: axiosMock,
            rootNode
        }),
        result = {};

    http.get(url, data => {
        if (!Array.isArray(data) || !data.length) {
            return;
        }
        const observationType = rootNode === "Datastreams" ? data[0].observationType : data[0].Datastreams[0].observationType,
            resultAssoc = getFilterableProperties(data);

        Object.entries(resultAssoc).forEach(([key, obj]) => {
            result[key] = Object.keys(obj);
        });
        onsuccess(result, observationType);
    }, null, null, onerror);
}

/**
 * Parses the STA data and prepares with an Object with the possible values.
 * @param {Objects[]} data Things als Array of Objects.
 * @returns {Object} Prepared Object with filterable values.
 */
function getFilterableProperties (data) {
    const resultAssoc = {};

    data.forEach(entity => {
        const properties = entity?.properties || false,
            datastreams = entity?.Datastreams || false,
            observations = entity?.Observations || false;

        // parse properties
        if (properties && isObject(properties)) {
            Object.entries(properties).forEach(([key, value]) => {
                if (!Object.prototype.hasOwnProperty.call(resultAssoc, key)) {
                    resultAssoc[key] = {};
                }
                resultAssoc[key][value] = true;
            });
        }

        // if entity is a Datastream and has observations
        if (observations && Array.isArray(observations) && observations.length > 0 && isObject(observations[0]) && observations[0].result) {
            if (!Object.prototype.hasOwnProperty.call(resultAssoc, "@Datastreams.0.Observations.0.result")) {
                resultAssoc["@Datastreams.0.Observations.0.result"] = {};
            }
            resultAssoc["@Datastreams.0.Observations.0.result"][observations[0].result] = true;
        }

        if (!Array.isArray(datastreams)) {
            return;
        }
        // parse Datastreams
        datastreams.forEach((Datastream, index) => {
            const ds_properties = Datastream?.properties || false,
                ds_observations = Datastream?.Observations || false;

            // parse Datastream properties
            if (ds_properties && isObject(ds_properties)) {
                Object.entries(ds_properties).forEach(([key, value]) => {
                    if (!Object.prototype.hasOwnProperty.call(resultAssoc, "@Datastreams." + index + ".properties." + key)) {
                        resultAssoc["@Datastreams." + index + ".properties." + key] = {};
                    }
                    resultAssoc["@Datastreams." + index + ".properties." + key][value] = true;
                });
            }
            // parse 1st observation
            if (ds_observations && Array.isArray(ds_observations) && ds_observations.length > 0 && isObject(ds_observations[0]) && ds_observations[0].result) {
                if (!Object.prototype.hasOwnProperty.call(resultAssoc, "@Datastreams." + index + ".Observations.0.result")) {
                    resultAssoc["@Datastreams." + index + ".Observations.0.result"] = {};
                }
                resultAssoc["@Datastreams." + index + ".Observations.0.result"][ds_observations[0].result] = true;
            }
        });

    });
    return resultAssoc;
}

/**
 * Gets the unique values from fetched properties.
 * @param {Object} properties The properies.
 * @param {String} attrName The attr name to look for.
 * @returns {String[]|Number[]} The list of unique values.
 */
function getUniqueValuesFromFetchedFeatures (properties, attrName) {
    if (!isObject(properties) || !Object.prototype.hasOwnProperty.call(properties, attrName)) {
        return [];
    }
    return properties[attrName];
}

export {
    fetchAllStaProperties,
    getUniqueValuesFromFetchedFeatures,
    getFilterableProperties
};
