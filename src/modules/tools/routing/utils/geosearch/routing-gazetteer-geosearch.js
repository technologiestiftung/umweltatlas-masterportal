import {RoutingGeosearchResult} from "../classes/routing-geosearch-result";
import {search} from "@masterportal/masterportalapi/src/searchAddress";

/**
 * Requests POIs from text from Gazetteer
 * @param {String} searchInput text to search with
 * @returns {RoutingGeosearchResult[]} routingGeosearchResults
 */
async function fetchRoutingGazetteerGeosearch (searchInput) {
    const fetchedResults = await search(searchInput, {
        searchAddress: true,
        searchStreets: true,
        searchHouseNumbers: true
    }, true);

    return fetchedResults.map(d => {
        d.epsg = "25832";
        return parseRoutingGazetteerGeosearchResult(d);
    });
}

/**
 * Parses Response from Gazetteer to RoutingGeosearchResult
 * @param {Object} geosearchResult from Gazetteer
 * @param {Object} [geosearchResult.geometry] geosearchResult geometry
 * @param {[Number, Number]} [geosearchResult.geometry.coordinates] geosearchResult geometry coordinates
 * @param {Object} [geosearchResult.properties] geosearchResult properties
 * @param {String} [geosearchResult.properties.text] geosearchResult properties text
 * @returns {RoutingGeosearchResult} routingGeosearchResult
 */
function parseRoutingGazetteerGeosearchResult (geosearchResult) {
    return new RoutingGeosearchResult(
        [Number(geosearchResult.geometry.coordinates[0]), Number(geosearchResult.geometry.coordinates[1])],
        geosearchResult.name,
        geosearchResult.epsg.toString()
    );
}

export {fetchRoutingGazetteerGeosearch};
