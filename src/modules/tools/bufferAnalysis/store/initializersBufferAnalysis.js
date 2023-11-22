import {
    LineString,
    MultiLineString,
    MultiPoint,
    MultiPolygon,
    LinearRing,
    Point,
    Polygon
} from "ol/geom";

/**
 * Injects OpenLayers geom classes to JSTS Parser
 *
 * @returns {void}
 */
function initJSTSParser ({getters}) {
    // inject possible geometries to jsts parser
    getters.jstsParser.inject(
        Point,
        LineString,
        LinearRing,
        Polygon,
        MultiPoint,
        MultiLineString,
        MultiPolygon
    );
}
/**
 * Initially loads all available options for select elements
 *
 * @return {void}
 */
function loadSelectOptions ({commit}) {
    const layers = Radio.request("ModelList", "getModelsByAttributes", {type: "layer", typ: "WFS"}) || [];

    layers.forEach(layer => {
        // freeze layer, else the map3d is observed by vue and performance suffers
        // only freeze non-webgl rendered layers, else the buffer cannot be disposed
        const _layer = layer.get("renderer") !== "webgl" ?
            Object.freeze(layer) : layer;

        commit("addSelectOption", _layer);
    });
}

export {
    initJSTSParser,
    loadSelectOptions
};
