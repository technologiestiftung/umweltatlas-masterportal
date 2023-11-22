import store from "../../../../app-store";
import isObject from "../../../../utils/isObject";
import isNumber from "../../../../utils/isNumber";
import {getMinMaxFromFetchedFeatures, getUniqueValuesFromFetchedFeatures} from "../utils/fetchAllOafProperties";
import openlayerFunctions from "../utils/openlayerFunctions";
import InterfaceOafExtern from "./interface.oaf.extern";
import InterfaceWfsIntern from "./interface.wfs.intern";
/**
 * InterfaceVectorTilesIntern is the filter interface for VectorTiles filtered by OpenLayers.
 * It uses the the OAF Extern interface under the hood for api requests like getUniqueValues.
 */
export default class InterfaceVectorTilesIntern {
    /**
     * @constructor
     * @param {IntervalRegister} intervalRegister The object to register and unregister intervals with.
     * @param {Function} handlers.getFeaturesByLayerId A function(layerId) to receive the features from ol with - only used for filter function.
     * @param {Function} handlers.isFeatureInMapExtent A function(feature) to check if the feature is in the current map extent.
     * @param {Function} handlers.isFeatureInGeometry A function(feature, geometry) to check if the feature intersects with the given geometry.
     */
    constructor (intervalRegister, {getFeaturesByLayerId, isFeatureInMapExtent, isFeatureInGeometry}) {
        this.intervalRegister = intervalRegister;
        this.getFeaturesByLayerId = getFeaturesByLayerId;
        this.isFeatureInMapExtent = isFeatureInMapExtent;
        this.isFeatureInGeometry = isFeatureInGeometry;
        this.interfaceOafExtern = new InterfaceOafExtern(intervalRegister);
        this.interfaceWFSIntern = new InterfaceWfsIntern(intervalRegister, {getFeaturesByLayerId, isFeatureInMapExtent, isFeatureInGeometry});
    }

    /**
     * Returns an object {attrName: Type} with all attributes and their types.
     * @param {Object} service the service to call, identical to filterQuestion.service
     * @param {Function} onsuccess a function({attrName: Type}[])
     * @param {Function} onerror a function(errorMsg)
     * @returns {void}
     */
    getAttrTypes (service, onsuccess, onerror) {
        const layerId = service?.layerId,
            layerModel = openlayerFunctions.getLayerByLayerId(layerId),
            listOfAllAttributes = {},
            result = {};
        let featuresInCurrentExtent = null;

        if (!layerModel) {
            if (typeof onerror === "function") {
                onerror(new Error(`InterfaceVectorTilesIntern.getAttrTypes: cannot find layer model for given layerId ${layerId}.`));
            }
            return;
        }

        featuresInCurrentExtent = layerModel.layer.getSource().getFeaturesInExtent(store.getters["Maps/getCurrentExtent"]);

        featuresInCurrentExtent.forEach(feature => {
            if (typeof feature?.getProperties !== "function") {
                return;
            }

            const properties = feature.getProperties();

            Object.entries(properties).forEach(([key, value]) => {
                if (!Array.isArray(listOfAllAttributes[key])) {
                    listOfAllAttributes[key] = [];
                }

                if (listOfAllAttributes[key].find(attributeValue => attributeValue === value)) {
                    return;
                }
                listOfAllAttributes[key].push(value);
            });
        });
        Object.entries(listOfAllAttributes).forEach(([attribute, values]) => {
            let typeofValue = "string";

            for (const value of values) {
                if (value === null || value === "" || typeof value === "undefined") {
                    continue;
                }
                if (isNumber(value)) {
                    typeofValue = "number";
                    break;
                }
                const valueType = typeof value;

                if (valueType === "string" || valueType === "boolean") {
                    typeofValue = valueType;
                    break;
                }
            }
            result[attribute] = typeofValue;
        });
        if (typeof onsuccess === "function") {
            onsuccess(result);
        }
    }

    /**
     * Returns the min and max values of the given service and attrName.
     * @param {Object} service the service to call, identical to filterQuestion.service
     * @param {String} attrName the attribute to receive the min and max value from
     * @param {Function} onsuccess a function({min, max}) with the received values
     * @param {Function} onerror a function(errorMsg)
     * @param {Boolean} [minOnly=false] if only min is of interest
     * @param {Boolean} [maxOnly=false] if only max is of interest
     * @returns {void}
     */
    getMinMax (service, attrName, onsuccess, onerror, minOnly, maxOnly) {
        const layerId = service?.layerId,
            layerModel = openlayerFunctions.getLayerByLayerId(layerId),
            allFetchedProperties = [];
        let minMaxValues = null,
            featuresInCurrentExtent = null;

        if (!layerModel) {
            if (typeof onerror === "function") {
                onerror(new Error(`InterfaceVectorTilesIntern.getMinMax: cannot find layer model for given layerId ${layerId}.`));
            }
            return;
        }
        featuresInCurrentExtent = layerModel.layer.getSource().getFeaturesInExtent(store.getters["Maps/getCurrentExtent"]);

        featuresInCurrentExtent.forEach(feature => {
            if (typeof feature.getProperties !== "function") {
                return;
            }
            allFetchedProperties.push(feature.getProperties());
        });

        minMaxValues = getMinMaxFromFetchedFeatures(allFetchedProperties, attrName, minOnly, maxOnly);

        if (minMaxValues === false) {
            if (typeof onerror === "function") {
                onerror(new Error("InterfaceVectorTilesIntern.getMinMax: an error occurred during the creation of min max values."));
            }
            return;
        }
        if (typeof onsuccess === "function") {
            onsuccess(minMaxValues);
        }
    }

    /**
     * Returns a list of unique values (unsorted) of the given service and attrName.
     * @param {Object} service the service to call, identical to filterQuestion.service
     * @param {String} attrName the attribute to receive unique values from
     * @param {Function} onsuccess a function([]) with the received unique values as Array of values
     * @param {Function} onerror a function(errorMsg)
     * @returns {void}
     */
    getUniqueValues (service, attrName, onsuccess, onerror) {
        const layerId = service?.layerId,
            layerModel = openlayerFunctions.getLayerByLayerId(layerId),
            allFetchedProperties = [];

        let featuresInCurrentExtent = null,
            uniqueValues = null;

        if (!layerModel) {
            if (typeof onerror === "function") {
                onerror(new Error(`InterfaceVectorTilesIntern.getUniqueValues: cannot find layer model for given layerId ${layerId}.`));
            }
            return;
        }

        featuresInCurrentExtent = layerModel.layer.getSource().getFeaturesInExtent(store.getters["Maps/getCurrentExtent"]);

        featuresInCurrentExtent.forEach(feature => {
            if (typeof feature.getProperties !== "function") {
                return;
            }
            allFetchedProperties.push(feature.getProperties());
        });

        uniqueValues = getUniqueValuesFromFetchedFeatures(allFetchedProperties, attrName);
        if (uniqueValues === false) {
            if (typeof onerror === "function") {
                onerror(new Error("InterfaceVectorTilesIntern.getUniqueValues: an error occurred during the creation of unique values."));
            }
            return;
        }
        if (typeof onsuccess === "function") {
            onsuccess(isObject(uniqueValues) ? Object.keys(uniqueValues) : []);
        }
    }

    /**
     * Cancels the current filtering.
     * @param {Number} filterId The id of the filter that should stop.
     * @param {Function} onsuccess A function to call when finished.
     * @param {Function} onerror A function to call on error.
     * @returns {void}
     */
    stop (filterId, onsuccess, onerror) {
        if (typeof this.intervalRegister?.stopPagingInterval !== "function") {
            if (typeof onerror === "function") {
                onerror(new Error("InterfaceVectorTilesIntern.stop: invalid intervalRegister"));
            }
            return;
        }

        this.intervalRegister.stopPagingInterval(filterId);
        if (typeof onsuccess === "function") {
            onsuccess();
        }
    }

    /**
     * Filters the given filterQuestion and returns the resulting filterAnswer.
     * @param {Object} filterQuestion An object with filterId, service and rules.
     * @param {Function} onsuccess A function(filterAnswer).
     * @param {Function} onerror A function(errorMsg).
     * @returns {void}
     */
    filter (filterQuestion, onsuccess, onerror) {
        if (typeof this.intervalRegister?.startPagingInterval !== "function" || typeof this.intervalRegister?.stopPagingInterval !== "function") {
            if (typeof onerror === "function") {
                onerror(new Error("InterfaceVectorTilesIntern.filter: invalid intervalRegister"));
            }
            return;
        }
        else if (typeof this.getFeaturesByLayerId !== "function") {
            if (typeof onerror === "function") {
                onerror(new Error("InterfaceVectorTilesIntern.filter: getFeaturesByLayerId must be a function"));
            }
            return;
        }
        else if (typeof this.isFeatureInMapExtent !== "function") {
            if (typeof onerror === "function") {
                onerror(new Error("InterfaceVectorTilesIntern.filter: isFeatureInMapExtent must be a function"));
            }
            return;
        }
        else if (typeof this.isFeatureInGeometry !== "function") {
            if (typeof onerror === "function") {
                onerror(new Error("InterfaceVectorTilesIntern.filter: isFeatureInGeometry must be a function"));
            }
            return;
        }
        else if (!isObject(filterQuestion)) {
            if (typeof onerror === "function") {
                onerror(new Error("InterfaceVectorTilesIntern.filter: filterQuestion must be an object"));
            }
            return;
        }
        const clonedQuestion = JSON.parse(JSON.stringify(filterQuestion)),
            service = clonedQuestion?.service,
            filterId = clonedQuestion?.filterId,
            snippetId = clonedQuestion?.snippetId,
            commands = clonedQuestion?.commands,
            rules = clonedQuestion?.rules,
            filterGeometry = filterQuestion?.commands?.filterGeometry,
            searchInMapExtent = commands?.searchInMapExtent,
            features = this.getFeaturesByLayerId(service?.layerId),
            paging = features.length; // paging does not work with vectorTile layers because it will be filtered with styles and paging will bring error, only the last paging features can be filtered.

        this.filterGivenFeatures(features, filterId, snippetId, service, rules, filterGeometry, searchInMapExtent, paging, onsuccess);
    }

    /* private */
    /**
     * Filters the given features by given params.
     * @param {ol/render/Feature[]} features The features.
     * @param {Number} filterId The filterId.
     * @param {Number} snippetId The snippetId.
     * @param {Object} service The service of the filter.
     * @param {Object} rules The rules to filter for.
     * @param {Object} filterGeometry If set it filters only in given geometry.
     * @param {Boolean} searchInMapExtent true if filters only in current map extent, false if not.
     * @param {Number} paging The paging.
     * @param {Function} onsuccess Function to be called on success.
     * @returns {void}
     */
    filterGivenFeatures (features, filterId, snippetId, service, rules, filterGeometry, searchInMapExtent, paging, onsuccess) {
        const len = Array.isArray(features) ? features.length : 0;
        let idx = 0;

        this.intervalRegister.startPagingInterval(filterId, () => {
            const items = [];

            for (let n = 0; n < paging; n++) {
                if (
                    (!searchInMapExtent || this.isFeatureInMapExtent(features[idx]))
                    && (!isObject(filterGeometry) || this.isFeatureInGeometry(features[idx], filterGeometry))
                    && this.checkRules(features[idx], rules)
                ) {
                    items.push(features[idx]);
                }
                idx++;
                if (idx >= len) {
                    break;
                }
            }
            if (idx >= len) {
                this.intervalRegister.stopPagingInterval(filterId);
            }

            if (typeof onsuccess === "function") {
                onsuccess({
                    service,
                    filterId,
                    snippetId,
                    paging: {
                        page: Math.ceil(idx / paging),
                        total: Math.ceil(len / paging)
                    },
                    items
                });
            }
        }, 1);
    }
    /**
     * Checks if the given feature matches with the given rules.
     * @param {ol/Feature} feature the feature to check
     * @param {Object} rules the rules from the filter question
     * @returns {Boolean} true if the feature matches, false if not
     */
    checkRules (feature, rules) {
        return this.interfaceWFSIntern.checkRules(feature, rules);
    }

    /**
     * Returns the property of the feature, recognizes @-path.
     * @param {ol/Feature} feature The feature.
     * @param {String} attrName The attrName to look up.
     * @returns {*} The property.
     */
    getPropertyFromFeature (feature, attrName) {
        return this.interfaceWFSIntern.getPropertyFromFeature(feature, attrName);
    }

    /**
     * Checks a reference and returns the given value as type of the reference.
     * @info will also convert the value of a given array in depth
     * @param {*} value the value of the rule to match featValue to
     * @param {*} reference the reference to match value for
     * @param {Number} [depth=0] the depth of the recursion to avoid infinit loop
     * @returns {*} featValue with changed type
     */
    changeValueToMatchReference (value, reference, depth = 0) {
        return this.interfaceWFSIntern.changeValueToMatchReference(value, reference, depth);
    }
}
