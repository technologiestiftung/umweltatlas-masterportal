import axios from "axios";
import {RoutingGeosearchResult} from "../classes/routing-geosearch-result";
import state from "../../store/stateRouting";
import store from "../../../../../app-store";
import crs from "@masterportal/masterportalapi/src/crs";

/**
 * Requests POIs from text from Komoot
 * @param {String} search text to search with
 * @returns {RoutingGeosearchResult[]} routingGeosearchResults
 */
async function fetchRoutingKomootGeosearch (search) {
    const map = mapCollection.getMap("2D"),
        mapBboxLng = crs.transformFromMapProjection(map, "EPSG:4326", [store.getters["Maps/boundingBox"][0], store.getters["Maps/boundingBox"][1]]),
        mapBboxLat = crs.transformFromMapProjection(map, "EPSG:4326", [store.getters["Maps/boundingBox"][2], store.getters["Maps/boundingBox"][3]]),
        mapBbox = mapBboxLng.concat(mapBboxLat),
        serviceUrl = store.getters.getRestServiceById(state.geosearch.serviceId).url,
        url = `${serviceUrl}lang=de&lon=10&lat=53.6&bbox=${mapBbox}&limit=${state.geosearch.limit}`,
        parameter = `&q=${encodeURIComponent(search)}`,
        response = await axios.get(url + parameter);

    if (response.status !== 200 && !response.data.success) {
        throw new Error({
            status: response.status,
            message: response.statusText
        });
    }
    return response.data.features.map(d => parseRoutingKomootGeosearchResult(d));
}

/**
 * Requests POI at coordinate from Komoot
 * @param {[Number, Number]} coordinates to search at
 * @returns {RoutingGeosearchResult} routingGeosearchResult
 */
async function fetchRoutingKomootGeosearchReverse (coordinates) {
    const serviceUrl = store.getters.getRestServiceById(state.geosearchReverse.serviceId).url,
        url = `${serviceUrl}lon=${coordinates[0]}&lat=${coordinates[1]}`,
        response = await axios.get(url);

    if (response.status !== 200 && !response.data.success) {
        throw new Error({
            status: response.status,
            message: response.statusText
        });
    }

    return parseRoutingKomootGeosearchResult(response.data.features[0]);
}

/**
 * Parses Response from Komoot to RoutingGeosearchResult
 * @param {Object} geosearchResult from Komoot
 * @param {Object} [geosearchResult.geometry] geosearchResult geometry
 * @param {[Number, Number]} [geosearchResult.geometry.coordinates] geosearchResult geometry coordinates
 * @param {Object} [geosearchResult.properties] geosearchResult properties
 * @param {String} [geosearchResult.properties.housenumber] geosearchResult properties housenumber
 * @param {String} [geosearchResult.properties.street] geosearchResult properties street
 * @param {String} [geosearchResult.properties.name] geosearchResult properties name
 * @returns {RoutingGeosearchResult} routingGeosearchResult
 */
function parseRoutingKomootGeosearchResult (geosearchResult) {
    return new RoutingGeosearchResult(
        [Number(geosearchResult.geometry.coordinates[0]), Number(geosearchResult.geometry.coordinates[1])],
        geosearchResult.properties.housenumber ? geosearchResult.properties.street + " " + geosearchResult.properties.housenumber : geosearchResult.properties.name
    );
}

export {fetchRoutingKomootGeosearch, fetchRoutingKomootGeosearchReverse};
