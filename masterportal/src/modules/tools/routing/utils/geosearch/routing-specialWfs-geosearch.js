import axios from "axios";
import {RoutingGeosearchResult} from "../classes/routing-geosearch-result";
import state from "../../store/stateRouting";
import store from "../../../../../app-store";

/**
 * Requests POIs from text from SpecialWfs
 * @param {String} search text to search with
 * @returns {RoutingGeosearchResult[]} routingGeosearchResults
 */
async function fetchRoutingSpecialWfsGeosearch (search) {
    const postData = buildWFSPostData(search),
        serviceUrl = store.getters.getRestServiceById(state.geosearch.serviceId).url,
        sendObject = {
            geometryName: state.geosearch.geometryName,
            propertyNames: state.geosearch.propertyNames,
            searchString: search,
            typeName: state.geosearch.typeName,
            url: serviceUrl
        },

        searchResults = await makeWFSRequest(serviceUrl, sendObject, postData);

    return searchResults.map((d) => parseRoutingSpecialWfsGeosearchResult(d));
}

/**
 * Builds the XML POST data for WFS request
 * @param {String} search text to search with
 * @returns {String} postData XML POST data
 */
function buildWFSPostData (search) {
    let postData =
        `<?xml version='1.0' encoding='UTF-8'?><wfs:GetFeature service='WFS' 
        xmlns:wfs='http://www.opengis.net/wfs' xmlns:ogc='http://www.opengis.net/ogc' xmlns:gml='http://www.opengis.net/gml' 
        traverseXlinkDepth='*' version='1.1.0'>`;

    postData += `<wfs:Query typeName='${state.geosearch.typeName}'>`;

    for (const propertyName of state.geosearch.propertyNames) {
        postData += `<wfs:PropertyName>${propertyName}</wfs:PropertyName>`;
    }

    postData += `<wfs:PropertyName>${state.geosearch.geometryName}</wfs:PropertyName>`;
    postData += `<wfs:maxFeatures>${state.geosearch.limit}</wfs:maxFeatures>`;
    postData += "<ogc:Filter>";

    if (state.geosearch.propertyNames.length > 1) {
        postData += "<ogc:Or>";
    }

    for (const propertyName of state.geosearch.propertyNames) {
        postData +=
            `<ogc:PropertyIsLike matchCase='false' wildCard='*' singleChar='#' escapeChar='!'>
            <ogc:PropertyName>${propertyName}</ogc:PropertyName>
            <ogc:Literal>*${search}*</ogc:Literal>
            </ogc:PropertyIsLike>`;
    }

    if (state.geosearch.propertyNames.length > 1) {
        postData += "</ogc:Or>";
    }

    postData += "</ogc:Filter></wfs:Query></wfs:GetFeature>";

    return postData;
}

/**
 * Makes a wfs request
 * @param  {string} serviceUrl url of the service from config
 * @param  {xml} sendObject Defintion from Config
 * @param {Object} postData wfsPostData
 * @returns {Object} searchResults
 */
async function makeWFSRequest (serviceUrl, sendObject, postData) {
    try {
        const response = await axios.post(serviceUrl, postData, {
                headers: {"Content-Type": "text/xml"}
            }),
            searchResults = await prepareValues(response.data, sendObject);

        return searchResults;
    }
    catch (error) {
        console.error(error);
        throw error;
    }
}

/**
 * Reads the Response-XML from the WFS 1.1.0 and returns the prepared search results
 * @description This function requires that the features in the root element of the response XML are listed as direct child elements.
 * @description The textContent of each element of a feature is used for the label.
 * @param  {xml} data Response of the request
 * @param {Object} definition Definition from config
 * @returns {array} resultList of prepared values
 */
function prepareValues (data, definition) {
    const parser = new DOMParser(),
        xmlDoc = parser.parseFromString(data, "text/xml"),
        typeName = definition.typeName,
        elements = xmlDoc.getElementsByTagNameNS("*", typeName.split(":")[1]),
        resultList = [];

    for (let i = 0; i < elements.length; i++) {
        const element = elements[i],
            identifierElement = element.getElementsByTagName("ms:LABEL_TEXT")[0],
            geometryElement = element.getElementsByTagName("gml:Point")[0];

        if (identifierElement && geometryElement) {
            const identifier = identifierElement.textContent,
                coordinatesText = geometryElement.getElementsByTagName("gml:pos")[0].textContent,
                coordinates = coordinatesText.trim().split(" ").map(Number),
                epsg = geometryElement.getAttribute("srsName");

            resultList.push({identifier, coordinates, epsg});
        }
        else {
            console.error("Missing properties in specialWFS-Response. Ignoring Feature...");
        }
    }

    return resultList;
}


/**
 * Parses Response from SpecialWfs to RoutingGeosearchResult
 * @param {Object} geosearchResult from SpecialWfs
 * @param {Number} [geosearchResult.coordinates] geosearchResult coordinates
 * @param {String} [geosearchResult.identifier] geosearchResult identifier
 * @param {String} [geosearchResult.epsg] geosearchResult epsg
 * @returns {RoutingGeosearchResult} routingGeosearchResult
 */
function parseRoutingSpecialWfsGeosearchResult (geosearchResult) {
    return new RoutingGeosearchResult(
        [Number(geosearchResult.coordinates[0]), Number(geosearchResult.coordinates[1])],
        geosearchResult.identifier,
        geosearchResult.epsg.split("EPSG:").pop()
    );
}

export {fetchRoutingSpecialWfsGeosearch, makeWFSRequest};
