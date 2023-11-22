import {convertColor} from "../../../../utils/convertColor.js";
import styleList from "@masterportal/masterportalapi/src/vectorStyle/styleList";

/**
 * Returns a list of image paths from the Legend
 * @param {Object[]} legendInfoList an array list of legend information
 * @param {Object} styleModel the style model
 * @returns {Object} an object with the label of the legendInfo (value of the attrName) as key and the path of the icon as value
 */
function getIconListFromLegend (legendInfoList, styleModel) {
    const result = {};

    legendInfoList?.forEach(legendInfo => {
        // always show icon if configured, independend of geometry type
        if (legendInfo.styleObject.type === "icon") {
            result[legendInfo.label] = legendInfo.styleObject.imagePath + legendInfo.styleObject.imageName;
        }
        else if (legendInfo.geometryType) {
            if (legendInfo.geometryType === "Point") {
                result[legendInfo.label] = createCircleSVG(styleModel);
            }
            else if (legendInfo.geometryType === "LineString") {
                result[legendInfo.label] = createLineSVG(legendInfo.styleObject);
            }
            else if (legendInfo.geometryType === "Polygon") {
                result[legendInfo.label] = createPolygonGraphic(legendInfo.styleObject);
            }
        }
    });

    return result;
}

/**
 * Returns style Model
 * @param {String} layerId layerId to get the legend data
 * @returns {Object} the style model
 */
function getStyleModel (layerId) {
    const layerModel = Radio.request("ModelList", "getModelByAttributes", {id: layerId});
    let styleId,
        styleModel;

    if (layerModel) {
        styleId = layerModel.get("styleId");
        if (styleId) {
            styleModel = styleList.returnStyleObject(styleId);
        }
    }

    return Object.freeze(styleModel);
}

/**
 * Creates a graphic for a polygon
 * @param   {vectorStyle} style feature styles
 * @returns {string} svg or data URL
 */
function createPolygonGraphic (style) {
    let svg = "";
    const fillColor = style.polygonFillColor ? convertColor(style.polygonFillColor, "rgbString") : "black",
        strokeColor = style.polygonStrokeColor ? convertColor(style.polygonStrokeColor, "rgbString") : "black",
        strokeWidth = style.polygonStrokeWidth,
        fillOpacity = style.polygonFillColor?.[3] || 0,
        strokeOpacity = style.polygonStrokeColor ? style.polygonStrokeColor[3] || 0 : 0,
        fillHatch = style.polygonFillHatch;

    if (fillHatch) {
        return style.getPolygonFillHatchLegendDataUrl();
    }

    svg += "<svg height='25' width='25'>";
    svg += "<polygon points='5,5 20,5 20,20 5,20' style='fill:";
    svg += fillColor;
    svg += ";fill-opacity:";
    svg += fillOpacity;
    svg += ";stroke:";
    svg += strokeColor;
    svg += ";stroke-opacity:";
    svg += strokeOpacity;
    svg += ";stroke-width:";
    svg += strokeWidth;
    svg += ";'/>";
    svg += "</svg>";

    return svg;
}

/**
 * Creates an SVG for a circle
 * @param   {vectorStyle} style feature styles
 * @returns {string} svg
 */
function createCircleSVG (style) {
    let svg = "";
    const circleStrokeColor = style.circleStrokeColor ? convertColor(style.circleStrokeColor, "rgbString") : "black",
        circleStrokeOpacity = Array.isArray(style.circleStrokeColor) && style.circleStrokeColor.length > 3 ? style.circleStrokeColor[3] : 0,
        circleStrokeWidth = style.circleStrokeWidth ? style.circleStrokeWidth : "auto",
        circleFillColor = style.circleFillColor ? convertColor(style.circleFillColor, "rgbString") : "black",
        circleFillOpacity = Array.isArray(style.circleFillColor) && style.circleFillColor.length > 3 ? style.circleFillColor[3] : 0;

    svg += "<svg height='25' width='25'>";
    svg += "<circle cx='12.5' cy='12.5' r='10' stroke='";
    svg += circleStrokeColor;
    svg += "' stroke-opacity='";
    svg += circleStrokeOpacity;
    svg += "' stroke-width='";
    svg += circleStrokeWidth;
    svg += "' fill='";
    svg += circleFillColor;
    svg += "' fill-opacity='";
    svg += circleFillOpacity;
    svg += "'/>";
    svg += "</svg>";

    return svg;
}

/**
 * Creates an SVG for a line
 * @param   {vectorStyle} style feature styles
 * @returns {string} svg
 */
function createLineSVG (style) {
    let svg = "";
    const strokeColor = style.lineStrokeColor ? convertColor(style.lineStrokeColor, "rgbString") : "black",
        strokeWidth = style.lineStrokeWidth,
        strokeOpacity = style.lineStrokeColor ? style.lineStrokeColor[3] || 0 : 0,
        strokeDash = style.lineStrokeDash ? style.lineStrokeDash.join(" ") : undefined;

    svg += "<svg height='25' width='25'>";
    svg += "<path d='M 05 20 L 20 05' stroke='";
    svg += strokeColor;
    svg += "' stroke-opacity='";
    svg += strokeOpacity;
    svg += "' stroke-width='";
    svg += strokeWidth;
    if (strokeDash) {
        svg += "' stroke-dasharray='";
        svg += strokeDash;
    }
    svg += "' fill='none'/>";
    svg += "</svg>";

    return svg;
}

export default {getStyleModel, getIconListFromLegend};
