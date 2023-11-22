import store from "../app-store/index";
import {convertColor} from "./convertColor";


/**
 * gets geometries from visible features on the map
 * @param {Object[]} visibleLayerList - all visible layers on the map
 * @return {String} geometries
 */
function getGeometries (visibleLayerList) {
    let measureGeometries = [],
        measureLabels = [],
        drawingGeometries = [],
        elevationMeasureGeometries = [];

    visibleLayerList.forEach(layer => {
        if (layer.getProperties()?.id === "measureLayer") {
            const polygons = store?.getters?.["Tools/Measure/polygonAreas"] || [],
                lines = store?.getters?.["Tools/Measure/lineLengths"] || [];

            measureGeometries = layer?.getSource()?.getFeatures();
            measureLabels = {...polygons, ...lines};
        }
        if (layer.getProperties()?.id === "importDrawLayer") {
            drawingGeometries = layer?.getSource()?.getFeatures();
        }
        if (layer.getProperties()?.id === "marker_point_layer") {
            elevationMeasureGeometries = layer?.getSource()?.getFeatures();
        }
    });

    return prepareGeometries(drawingGeometries, measureGeometries, measureLabels, elevationMeasureGeometries);

}
/**
     * Prepares geometries for printing drawnings from Draw, MeasureInMap and ElevationMeasure tools
     * @param {Array} drawingGeometries - geometries from draw tool
     * @param {Array} measureGeometries - geometries from measure tool
     * @param {Array} measureLabels - infos for label of measure tool
     * @param {Array} elevationMeasureGeometries - geometries from elevationMeasure tool
     * @return {String} prepared geometries for printing
     */
function prepareGeometries (drawingGeometries, measureGeometries, measureLabels, elevationMeasureGeometries) {
    const drawingAndMeasureGeometries = [...drawingGeometries, ...measureGeometries, ...elevationMeasureGeometries];
    let geometries = "";

    drawingAndMeasureGeometries.forEach((feature, index) => {
        const type = feature?.getGeometry()?.getType(),
            coordinates = feature?.getGeometry()?.getCoordinates(),
            drawState = feature?.get("drawState");

        if (type === "Point") {
            const convertedPointCoordinates = `${coordinates?.[0]} ${coordinates?.[1]}`,
                pointColor = drawState ? convertColor(drawState.color, "hex") : "orange",
                featureId = feature?.get("featureId"),
                elevationMeasureText = feature.getStyle()?.[0]?.getText()?.text_;
            let pointText = "";

            // If Point has 'featureId' it is MeasureInMap point
            if (featureId) {
                pointText = ` ${measureLabels?.[featureId]}`;
            }
            // If Point has 'pointText' it is ElevationMeasure point
            else if (elevationMeasureText) {
                pointText = ` ${elevationMeasureText}`;
            }

            geometries += index === 0
                ? `[${pointColor},${convertedPointCoordinates}${pointText}]`
                : `|[${pointColor},${convertedPointCoordinates}${pointText}]`;
        }
        else if (type === "Polygon") {
            const convertedPolygonCoordinates = coordinates?.[0].flatMap((coordPoint) => `${coordPoint[0]} ${coordPoint[1]}`),
                polyColor = drawState ? convertColor(drawState.color, "hex") : "orange";

            geometries += index === 0
                ? `[${polyColor},${[...convertedPolygonCoordinates]}]`
                : `|[${polyColor},${[...convertedPolygonCoordinates]}]`;
        }
        else if (type === "LineString") {
            const convertedLineCoordinates = coordinates?.flatMap(coordPoint => `${coordPoint?.[0]} ${coordPoint?.[1]}`),
                colorContour = drawState ? convertColor(drawState.color, "hex") : "orange";

            geometries += index === 0
                ? `[${colorContour},${[...convertedLineCoordinates]}]`
                : `|[${colorContour},${[...convertedLineCoordinates]}]`;
        }
    });
    return geometries;
}

export {
    getGeometries,
    prepareGeometries
};
