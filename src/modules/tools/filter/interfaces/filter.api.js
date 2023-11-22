import hash from "object-hash";
import isObject from "../../../../utils/isObject";
import openlayerFunctions from "../utils/openlayerFunctions.js";
import IntervalRegister from "../utils/intervalRegister.js";
import InterfaceWfsIntern from "./interface.wfs.intern.js";
import InterfaceWfsExtern from "./interface.wfs.extern.js";
import InterfaceOafIntern from "./interface.oaf.intern.js";
import InterfaceOafExtern from "./interface.oaf.extern.js";
import InterfaceGeojsonIntern from "./interface.geojson.intern.js";
import InterfaceGeojsonExtern from "./interface.geojson.extern.js";
import InterfaceStaIntern from "./interface.sta.intern.js";
import InterfaceStaExtern from "./interface.sta.extern.js";
import InterfaceVectorTilesIntern from "./interface.vectortiles.intern";

/**
 * FilterApi is the api to use in vue environment. It encapsulates the filter interfaces.
 * @class
 */
export default class FilterApi {
    /**
     * @constructor
     * @param {Number} filterId the id of the VueFilter/Layer
     */
    constructor (filterId) {
        this.filterId = filterId;
        this.service = null;

        if (!(FilterApi.intervalRegister instanceof IntervalRegister)) {
            FilterApi.intervalRegister = new IntervalRegister();
            FilterApi.cache = {};
            FilterApi.waitingList = {};
            FilterApi.interfaces = {
                wfsIntern: new InterfaceWfsIntern(FilterApi.intervalRegister, {getFeaturesByLayerId: openlayerFunctions.getFeaturesByLayerId, isFeatureInMapExtent: openlayerFunctions.isFeatureInMapExtent, isFeatureInGeometry: openlayerFunctions.isFeatureInGeometry}),
                wfsExtern: new InterfaceWfsExtern({getCurrentExtent: openlayerFunctions.getCurrentExtent}),
                oafIntern: new InterfaceOafIntern(FilterApi.intervalRegister, {getFeaturesByLayerId: openlayerFunctions.getFeaturesByLayerId, isFeatureInMapExtent: openlayerFunctions.isFeatureInMapExtent, isFeatureInGeometry: openlayerFunctions.isFeatureInGeometry}),
                oafExtern: new InterfaceOafExtern(),
                geojsonIntern: new InterfaceGeojsonIntern(FilterApi.intervalRegister, {getFeaturesByLayerId: openlayerFunctions.getFeaturesByLayerId, isFeatureInMapExtent: openlayerFunctions.isFeatureInMapExtent, isFeatureInGeometry: openlayerFunctions.isFeatureInGeometry}),
                geojsonExtern: new InterfaceGeojsonExtern(),
                staIntern: new InterfaceStaIntern(FilterApi.intervalRegister, {getFeaturesByLayerId: openlayerFunctions.getFeaturesByLayerId, isFeatureInMapExtent: openlayerFunctions.isFeatureInMapExtent, isFeatureInGeometry: openlayerFunctions.isFeatureInGeometry}),
                staExtern: new InterfaceStaExtern(),
                vectortilesIntern: new InterfaceVectorTilesIntern(FilterApi.intervalRegister, {getFeaturesByLayerId: openlayerFunctions.getVectorTileFeaturesByLayerId, isFeatureInMapExtent: openlayerFunctions.isFeatureInMapExtent, isFeatureInGeometry: openlayerFunctions.isFeatureInGeometry})
            };
        }
    }

    /**
     * Setter for the service.
     * @param {Object} service - The api service.
     * @returns {void}
     */
    setService (service) {
        this.service = service;
    }

    /**
     * Setter for the default service by layerId and layerModel.
     * @param {String} layerId the layer id
     * @param {ol/Layer} layerModel the layer model
     * @param {Boolean} extern if true, the type given by layerModel is used, otherwise "tree" is used
     * @param {Function} onerror a function(Error)
     * @returns {void}
     */
    setServiceByLayerModel (layerId, layerModel, extern, onerror) {
        if (!isObject(layerModel)) {
            return;
        }
        const type = layerModel.get("typ").toLowerCase(),
            featureNS = layerModel.get("featureNS"),
            url = layerModel.get("url"),
            featureType = layerModel.get("featureType");

        if (type === "wfs") {
            this.service = {
                type,
                extern,
                layerId,
                url,
                typename: featureType,
                namespace: featureNS,
                srsName: openlayerFunctions.getMapProjection(),
                featureNS: featureNS.substr(0, featureNS.lastIndexOf("/")),
                featurePrefix: featureNS.substr(featureNS.lastIndexOf("/") + 1),
                featureTypes: [featureType]
            };
        }
        else if (type === "oaf") {
            if (!extern) {
                this.service = {
                    type,
                    extern,
                    layerId,
                    url,
                    collection: layerModel.get("collection"),
                    namespace: featureNS,
                    limit: typeof layerModel.get("limit") === "undefined" ? 400 : layerModel.get("limit")
                };
            }
            else {
                onerror(new Error("FilterApi.setServiceByLayerModel: Filtering oaf extern is not supported yet."));
            }
        }
        else if (type === "geojson") {
            if (!extern) {
                this.service = {
                    type,
                    extern,
                    layerId,
                    url
                };
            }
            else {
                onerror(new Error("FilterApi.setServiceByLayerModel: Filtering geojson extern is not supported."));
            }
        }
        else if (type === "sensorthings") {
            if (!extern) {
                this.service = {
                    type,
                    extern,
                    layerId
                };
            }
            else {
                onerror(new Error("FilterApi.setServiceByLayerModel: Filtering sta extern is not supported."));
            }
        }
        else if (type === "vectortile") {
            if (!extern) {
                this.service = {
                    type,
                    extern,
                    layerId
                };
            }
            else {
                onerror(new Error("FilterApi.setServiceByLayerModel: Filtering vectortiles extern is not supported."));
            }
        }
        else if (typeof onerror === "function") {
            onerror(new Error("FilterApi.setServiceByLayerModel: Unknown layer type " + type));
        }
    }
    /**
     * Returns an object {attrName: Type} with all attributes and their types.
     * @param {Function} onsuccess a function({attrName: Type}[])
     * @param {Function} onerror a function(Error)
     * @returns {void}
     */
    getAttrTypes (onsuccess, onerror) {
        if (!isObject(this.service)) {
            if (typeof onerror === "function") {
                onerror(new Error("FilterApi.getAttrTypes: You have to set a default service first before using this function."));
            }
            return;
        }
        const connector = this.getInterfaceByService(this.service, onerror),
            cacheKey = hash.sha1(["getAttrTypes", JSON.stringify(this.service)].join("."));

        if (Object.prototype.hasOwnProperty.call(FilterApi.cache, cacheKey)) {
            if (typeof onsuccess === "function") {
                onsuccess(FilterApi.cache[cacheKey]);
            }
        }
        else if (!isObject(connector) || typeof connector.getAttrTypes !== "function") {
            if (typeof onerror === "function") {
                onerror(new Error("FilterApi.getAttrTypes: The connector should be an object and have a function getAttrTypes."));
            }
        }
        else if (!Array.isArray(FilterApi.waitingList[cacheKey])) {
            FilterApi.waitingList[cacheKey] = [];
            FilterApi.waitingList[cacheKey].push({onsuccess, onerror});
            connector.getAttrTypes(this.service, result => {
                FilterApi.cache[cacheKey] = result;
                FilterApi.waitingList[cacheKey].forEach(obj => {
                    if (typeof obj.onsuccess === "function") {
                        obj.onsuccess(result);
                    }
                });
            }, error => {
                FilterApi.waitingList[cacheKey].forEach(obj => {
                    if (typeof obj.onerror === "function") {
                        obj.onerror(error);
                    }
                });
            }, this.filterId);
        }
        else {
            FilterApi.waitingList[cacheKey].push({onsuccess, onerror});
        }
    }
    /**
     * Returns the min and max values of the given service and attrName.
     * @param {String} attrName the attribute to receive the min and max value from
     * @param {Function} onsuccess a function({min, max}) with the received values
     * @param {Function} onerror a function(Error)
     * @param {Boolean} [minOnly=false] if only min is of interest
     * @param {Boolean} [maxOnly=false] if only max is of interest
     * @param {Boolean} [isDate=false] if only from date or dateRange
     * @param {Object[]} rules the rules to restrict the request
     * @param {Number} filterId the filterId
     * @returns {void}
     */
    getMinMax (attrName, onsuccess, onerror, minOnly, maxOnly, isDate, {rules, filterId, format, commands}) {
        if (!isObject(this.service)) {
            if (typeof onerror === "function") {
                onerror(new Error("FilterApi.getMinMax: You have to set a default service first before using this function."));
            }
            return;
        }
        const connector = this.getInterfaceByService(this.service, onerror),
            cacheKey = hash.sha1(["getMinMax", JSON.stringify(this.service), attrName, minOnly, maxOnly, filterId].join("."));

        if (Object.prototype.hasOwnProperty.call(FilterApi.cache, cacheKey)) {
            if (typeof onsuccess === "function") {
                onsuccess(FilterApi.cache[cacheKey]);
            }
        }
        else if (!isObject(connector) || typeof connector.getMinMax !== "function") {
            if (typeof onerror === "function") {
                onerror(new Error("FilterApi.getMinMax: The connector should be an object and have a function getMinMax."));
            }
        }
        else if (!Array.isArray(FilterApi.waitingList[cacheKey])) {
            FilterApi.waitingList[cacheKey] = [];
            FilterApi.waitingList[cacheKey].push({onsuccess, onerror});
            connector.getMinMax(this.service, attrName, result => {
                FilterApi.cache[cacheKey] = result;
                FilterApi.waitingList[cacheKey].forEach(obj => {
                    if (typeof obj.onsuccess === "function") {
                        obj.onsuccess(result);
                    }
                });
            }, error => {
                FilterApi.waitingList[cacheKey].forEach(obj => {
                    if (typeof obj.onerror === "function") {
                        obj.onerror(error);
                    }
                });
            }, minOnly, maxOnly, isDate, {rules, filterId, format, commands});
        }
        else {
            FilterApi.waitingList[cacheKey].push({onsuccess, onerror});
        }
    }
    /**
     * Returns a list of sorted unique values of the given service and attrName.
     * @param {String} attrName the attribute to receive unique values from
     * @param {Function} onsuccess a function([]) with the received unique values as Array of values
     * @param {Function} onerror a function(Error)
     * @param {Object[]} rules the rules to restrict the request
     * @param {Number} filterId the filterId
     * @returns {void}
     */
    getUniqueValues (attrName, onsuccess, onerror, {rules, filterId, commands}) {
        if (!isObject(this.service)) {
            if (typeof onerror === "function") {
                onerror(new Error("FilterApi.getUniqueValues: You have to set a default service first before using this function."));
            }
            return;
        }
        const connector = this.getInterfaceByService(this.service, onerror),
            cacheKey = hash.sha1(["getUniqueValues",
                JSON.stringify(this.service),
                attrName,
                filterId].join("."));

        if (Object.prototype.hasOwnProperty.call(FilterApi.cache, cacheKey)) {
            if (typeof onsuccess === "function") {
                onsuccess(FilterApi.cache[cacheKey]);
            }
        }
        else if (!isObject(connector) || typeof connector.getUniqueValues !== "function") {
            if (typeof onerror === "function") {
                onerror(new Error("FilterApi.getUniqueValues: The connector should be an object and have a function getUniqueValues."));
            }
        }
        else if (!Array.isArray(FilterApi.waitingList[cacheKey])) {
            FilterApi.waitingList[cacheKey] = [];
            FilterApi.waitingList[cacheKey].push({onsuccess, onerror});
            connector.getUniqueValues(this.service, attrName, result => {
                FilterApi.cache[cacheKey] = result;
                FilterApi.waitingList[cacheKey].forEach(obj => {
                    if (typeof obj.onsuccess === "function") {
                        obj.onsuccess(result);
                    }
                });
            }, error => {
                FilterApi.waitingList[cacheKey].forEach(obj => {
                    if (typeof obj.onerror === "function") {
                        obj.onerror(error);
                    }
                });
            }, {rules, filterId, commands});
        }
        else {
            FilterApi.waitingList[cacheKey].push({onsuccess, onerror});
        }
    }
    /**
     * Filters the given filterQuestion and returns the resulting filterAnswer.
     * @param {Object} filterQuestion an object with filterId, service and rules
     * @param {Function} onsuccess a function(filterAnswer)
     * @param {Function} onerror a function(Error)
     * @returns {void}
     */
    filter (filterQuestion, onsuccess, onerror) {
        if (!isObject(this.service)) {
            if (typeof onerror === "function") {
                onerror(new Error("FilterApi.filter: You have to set a default service first before using this function."));
            }
            return;
        }
        const connector = this.getInterfaceByService(this.service, onerror);

        if (isObject(connector) && typeof connector.filter === "function") {
            connector.filter(Object.assign(filterQuestion, {service: this.service}), onsuccess, onerror);
        }
    }
    /**
     * Stops the current filter.
     * @param {Function} onsuccess a function()
     * @param {Function} onerror a function(Error)
     * @returns {void}
     */
    stop (onsuccess, onerror) {
        if (!isObject(this.service)) {
            if (typeof onerror === "function") {
                onerror(new Error("FilterApi.stop: You have to set a default service first before using this function."));
            }
            return;
        }
        const connector = this.getInterfaceByService(this.service, onerror);

        if (typeof connector.stop === "function") {
            connector.stop(this.filterId, onsuccess, onerror);
        }
    }


    /* private */

    /**
     * Returns the interface for the given service.
     * @param {Object} service the service to recognize the interface with
     * @param {Function} onerror a function(Error)
     * @returns {Object|Boolean} an object to use as interface or false if an error occured
     */
    getInterfaceByService (service, onerror) {
        const type = isObject(service) && typeof service.type === "string" ? service.type.toLowerCase() : false;

        if (type === "wfs" && !service.extern) {
            return FilterApi.interfaces.wfsIntern;
        }
        else if (type === "wfs" && service.extern) {
            return FilterApi.interfaces.wfsExtern;
        }
        else if (type === "oaf" && !service.extern) {
            return FilterApi.interfaces.oafIntern;
        }
        else if (type === "oaf" && service.extern) {
            return FilterApi.interfaces.oafExtern;
        }
        else if (type === "geojson" && !service.extern) {
            return FilterApi.interfaces.geojsonIntern;
        }
        else if (type === "geojson" && service.extern) {
            return FilterApi.interfaces.geojsonExtern;
        }
        else if (type === "sensorthings" && !service.extern) {
            return FilterApi.interfaces.staIntern;
        }
        else if (type === "sensorthings" && service.extern) {
            return FilterApi.interfaces.staExtern;
        }
        else if (type === "vectortile" && !service.extern) {
            return FilterApi.interfaces.vectortilesIntern;
        }
        else if (type === "vectortile" && service.extern) {
            return FilterApi.interfaces.oafExtern;
        }
        else if (typeof onerror === "function") {
            onerror(new Error("FilterApi.getInterfaceByService: Unknown service type " + type));
        }
        return false;
    }
}
