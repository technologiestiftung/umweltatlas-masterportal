import {KML} from "ol/format.js";
import getProjections from "./getProjections";
import proj4 from "proj4";
import isObject from "./isObject";

const colorOptions = [
    {color: "blue", value: [55, 126, 184]},
    {color: "black", value: [0, 0, 0]},
    {color: "green", value: [77, 175, 74]},
    {color: "grey", value: [153, 153, 153]},
    {color: "orange", value: [255, 127, 0]},
    {color: "red", value: [228, 26, 28]},
    {color: "white", value: [255, 255, 255]},
    {color: "yellow", value: [255, 255, 51]}
];

/**
 * Checks whether bots arrays are of length 3 and whether their values are equal at the same positions.
 * Used to check if two colors are the same.
 *
 * @param {number[]} arrOne First array.
 * @param {number[]} arrTwo Second array.
 * @returns {boolean} true, if both are arrays of length 3 consisting of the same values; false, else.
 */
function allCompareEqual (arrOne, arrTwo) {
    return Array.isArray(arrOne)
        && arrOne.length === 3
        && Array.isArray(arrTwo)
        && arrTwo.length === 3
        && arrOne.every((val, index) => val === arrTwo[index]);
}

/**
 * Creates the IconStyle-Part of a Point-KML. Contains the link to a SVG.
 *
 * @see https://developers.google.com/kml/documentation/kmlreference#iconstyle
 * @param {string} url URL from where the Icon can be retrieved from.
 * @param {number} scale Scale of the Icon. NOTE: If this value is 0, the Icon is not displayed.
 * @returns {string} The IconStyle-Part of a KML-File.
 */
function createKmlIconStyle (url, scale) {
    const scaleTag = `<scale>${scale}</scale>`,
        href = `<href>${url}</href>`;

    return `<IconStyle>${scaleTag}<Icon>${href}</Icon></IconStyle>`;
}

/**
 * If the given color is included in the color options of the Draw Tool the name of the color is returned.
 *
 * @param {number[]} color The color of which the name is to be retrieved.
 * @returns {string} The name of the color corresponding to the number array.
 */
function getIconColor (color) {
    const selectedOption = colorOptions.filter(option => allCompareEqual(color, option.value));

    if (selectedOption && selectedOption[0]) {
        return selectedOption[0].color;
    }
    return "";
}

/**
 * Constructs the hotspot-tag (anchoring of the icon) of an IconStyle-Part of a Point-KML.
 *
 * @see https://developers.google.com/kml/documentation/kmlreference#hotspot
 * @param {Object} anchor Values for the hotspot-tag are retrieved from this object.
 * @returns {string} hotspot-Tag for a KML IconStyle.
 */
function getKmlHotSpotOfIconStyle (anchor) {
    const x = anchor.anchor[0],
        y = anchor.anchor[1],
        {xUnit, yUnit} = anchor;

    return `<hotSpot x="${x}" y="${y}" xunits="${xUnit}" yunits="${yUnit}" />`;
}

/**
 * Transforms the given line or polygon coordinates from the maps currently used projection to EPSG:4326.
 *
 * @param {(Array<number>|Array<Array<number>>|Array<Array<Array<number>>>)} coords Coordinates.
 * @param {Boolean} isPolygon Determines whether the given coordinates are a polygon or a line.
 * @returns {(Array<number>|Array<Array<number>>|Array<Array<Array<number>>>)} Transformed coordinates.
 */
function transform (coords, isPolygon) {
    const transCoords = [];

    for (const value of coords) {
        if (isPolygon) {
            value.forEach(point => {
                transCoords.push(transformPoint(point));
            });
            continue;
        }
        transCoords.push(transformPoint(value));
    }

    return isPolygon ? [transCoords] : transCoords;
}

/**
 * Transforms the given point coordinates from the maps currently used projection to EPSG:4326.
 *
 * @param {number[]} coords Coordinates.
 * @returns {number[]} Transformed coordinates.
 */
function transformPoint (coords) {
    const projections = getProjections("EPSG:4326");

    return proj4(projections.sourceProj, projections.destProj, coords);
}

/**
 * Transforms the given geometry from the maps currently used projection to EPSG:4326.
 * If the geometry is not an instance of ol/LineString, ol/Point or ol/Polygon an Alert is send to the user.
 *
 * @param {module:ol/geom/Geometry} geometry Geometry to be transformed.
 * @returns {(Array<number>|Array<Array<number>>|Array<Array<Array<number>>>)|[]} The transformed Geometry or an empty array.
 */
function transformCoordinates (geometry) {
    const coords = geometry.getCoordinates(),
        type = geometry.getType();

    switch (type) {
        case "LineString":
            return transform(coords, false);
        case "Point":
            return transformPoint(coords);
        case "Polygon":
            return transform(coords, true);
        default:
            // dispatch("Alerting/addSingleAlert", i18next.t("common:modules.tools.download.unknownGeometry", {geometry: type}), {root: true});
            return [];
    }
}

/**
 * convert features to string
 * @param {ol.Feature[]} features - the used features
 * @param {object} format of the features
 * @return {String} convertedFeatures - The features converted to KML.
 */
function convertFeatures (features, format) {
    const convertedFeatures = [];
    let kml = null;

    for (const feature of features) {
        const cloned = feature.clone(),
            transCoords = transformCoordinates(cloned.getGeometry());

        if (transCoords.length === 3 && transCoords[2] === 0) {
            transCoords.pop();
        }

        cloned.getGeometry().setCoordinates(transCoords, "XY");
        convertedFeatures.push(cloned);
    }

    kml = getKMLWithCustomAttributes(convertedFeatures, format);
    if (kml === null) {
        return format.writeFeatures(convertedFeatures);
    }

    return new XMLSerializer().serializeToString(kml);
}

/**
 * Gets a kml document which has custom attributes from given features added.
 * @param {ol.Feature[]} features The features.
 * @param {object} format The format of the features.
 * @returns {Document|null} The KML Document
 */
function getKMLWithCustomAttributes (features, format) {
    if (!Array.isArray(features) || !isObject(format) || !features.some(feature => typeof feature.get === "function" && feature.get("attributes"))) {
        return null;
    }

    features.forEach(feature => {
        if (typeof feature.getStyle() === "function") {
            const styles = feature.getStyle()(feature);

            if (Array.isArray(styles) && styles.length > 0) {
                const style = styles[styles.length - 1];

                if (style?.getText()?.getText() === "*") {
                    style.setText();
                }
            }
        }
    });

    const kml = new DOMParser().parseFromString(format.writeFeatures(features), "text/xml"),
        placemarks = kml.getElementsByTagName("Placemark");

    if (!placemarks.length) {
        return null;
    }
    features.forEach((feature, idx) => {
        const attributes = feature.get("attributes"),
            attributeKeys = isObject(attributes) ? Object.keys(attributes) : [];

        if (!attributeKeys.length) {
            return;
        }
        attributeKeys.forEach(attrKey => {
            if (placemarks[idx]) {
                const extendedData = placemarks[idx].querySelector("ExtendedData"),
                    data = typeof extendedData.querySelector === "function" ? extendedData.querySelector(`Data[name='${attrKey}']`) : undefined,
                    existingDataNode = typeof extendedData.querySelector === "function" ? extendedData.querySelector(`Data[name='custom-attribute____${attrKey}']`) : undefined;

                if (existingDataNode instanceof Element) {
                    existingDataNode.remove();
                }

                if (typeof data?.setAttribute === "function") {
                    data.setAttribute("name", `custom-attribute____${attrKey}`);
                }
            }
        });
    });
    return kml;
}

/**
 * Converts the features to KML while also saving its style information.
 * @param {ol.Feature[]} features - the used features
 * @returns {String} The features written in KML as a String.
 */
export default async function convertFeaturesToKml (features) {
    const featureCount = features.length,
        anchors = Array(featureCount).fill(undefined),
        format = new KML({extractStyles: true}),
        hasIconUrl = Array(featureCount).fill(false),
        pointColors = Array(featureCount).fill(undefined),
        pointScales = Array(featureCount).fill(undefined),
        skip = Array(featureCount).fill(false),
        textFonts = Array(featureCount).fill(undefined),
        textFontSize = Array(featureCount).fill(undefined),
        convertedFeatures = new DOMParser().parseFromString(convertFeatures(features, format), "text/xml");

    features.forEach((feature, i) => {
        const type = feature.getGeometry().getType();
        let color,
            style,
            styles;

        if (type === "Point" && feature.values_.drawState && feature.values_.drawState.text !== undefined) {
            // Imported KML with text, can be used as it is
            skip[i] = true;
            textFontSize[i] = feature.values_.drawState.fontSize;
        }
        else {
            try {
                styles = feature.getStyleFunction()(feature);
                style = Array.isArray(styles) ? styles[0] : styles;
            }
            catch (err) {
                // Only happens if an imported KML is exported, can be skipped
                skip[i] = true;
            }

            if (type === "Point") {
                if (style.getImage() !== null && style.getImage().iconImage_ !== undefined) {
                    // Imported KML with link to SVG icon, has iconUrl from previous import
                    hasIconUrl[i] = true;
                    const anchorXUnits = style.getImage().anchorXUnits_,
                        anchorYUnits = style.getImage().anchorYUnits_,
                        anchor = style.getImage().anchor_;

                    anchors[i] = {xUnit: anchorXUnits, yUnit: anchorYUnits, anchor: anchor};
                }
                else if (style.getText()) {
                    textFonts[i] = style.getText().getFont();
                }
                else {
                    color = style.getImage().getFill().getColor();
                    pointColors[i] = [color[0], color[1], color[2]];
                    pointScales[i] = Math.max(...style.getImage().getSize()) / 32;
                }
            }
        }
    });

    Array.from(convertedFeatures.getElementsByTagName("Placemark")).forEach((placemark, i) => {
        if (placemark.getElementsByTagName("Point").length > 0 && skip[i] === false) {
            const style = placemark.getElementsByTagName("Style")[0];

            if (hasIconUrl[i] === false && pointColors[i]) {
                // Please be aware of devtools/tasks/replace.js and devtools/tasks/customBuildPortalconfigsReplace.js if you change the path of the SVG
                const iconUrl = `${window.location.origin}/img/tools/draw/circle_${getIconColor(pointColors[i])}.svg`,
                    iconStyle = createKmlIconStyle(iconUrl, pointScales[i]);

                style.innerHTML += iconStyle;
            }
            else if (hasIconUrl[i] === true && anchors[i] !== undefined) {
                const iconStyle = placemark.getElementsByTagName("IconStyle")[0];

                iconStyle.innerHTML += getKmlHotSpotOfIconStyle(anchors[i]);
            }
        }

        // Setting format for text
        if (placemark.getElementsByTagName("Point").length > 0 && skip[i] === true && !isNaN(textFontSize[i])) {
            const scale = textFontSize[i] / 16,
                style = placemark.getElementsByTagName("Style")[0],
                iconUrl = `${window.location.origin}/img/tools/draw/circle_blue.svg`,
                maskIcon = new DOMParser().parseFromString("<IconStyle><scale>0</scale><Icon><href>" + iconUrl + "</href></Icon></IconStyle>", "text/xml"),
                maskScale = new DOMParser().parseFromString("<scale>" + scale + "</scale>", "text/xml");

            style.getElementsByTagName("LabelStyle")[0].appendChild(maskScale.getElementsByTagName("scale")[0]);
            style.appendChild(maskIcon.getElementsByTagName("IconStyle")[0]);
        }
    });
    return new XMLSerializer().serializeToString(convertedFeatures);
}

export {
    convertFeatures,
    transformCoordinates,
    getKMLWithCustomAttributes
};
