import {wfs} from "@masterportal/masterportalapi";
import LoaderOverlay from "../../utils/loaderOverlay";
import Layer from "./layer";
import styleList from "@masterportal/masterportalapi/src/vectorStyle/styleList";
import createStyle from "@masterportal/masterportalapi/src/vectorStyle/createStyle";
import getGeometryTypeFromService from "@masterportal/masterportalapi/src/vectorStyle/lib/getGeometryTypeFromService";
import store from "../../app-store";
import * as bridge from "./RadioBridge.js";
import Cluster from "ol/source/Cluster";
import {bbox, all} from "ol/loadingstrategy.js";
import {getCenter} from "ol/extent";
import webgl from "./renderer/webgl";
import getProxyUrl from "../../utils/getProxyUrl";

const geometryTypeRequestLayers = [];

/**
 * Creates a layer of type WFS.
 * @param {Object} attrs  attributes of the layer
 * @returns {void}
 */
export default function WFSLayer (attrs) {
    const defaults = {
        supported: ["2D", "3D"],
        showSettings: true,
        isSecured: false,
        altitudeMode: "clampToGround",
        useProxy: false,
        sourceUpdated: false
    };

    this.createLayer(Object.assign(defaults, attrs));


    // override class methods for webgl rendering
    // has to happen before setStyle/styling
    if (attrs.renderer === "webgl") {
        webgl.setLayerProperties(this);
    }

    // call the super-layer
    Layer.call(this, Object.assign(defaults, attrs), this.layer, !attrs.isChildLayer);
    this.initStyle(attrs);
    this.prepareFeaturesFor3D(this.layer.getSource().getFeatures());
}
// Link prototypes and add prototype methods, means WFSLayer uses all methods and properties of Layer
WFSLayer.prototype = Object.create(Layer.prototype);

/**
 * Creates a layer of type WFS by using wfs-layer of the masterportalapi.
 * Sets all needed attributes at the layer and the layer source.
 * @param {Object} attrs  params of the raw layer
 * @returns {void}
 */
WFSLayer.prototype.createLayer = function (attrs) {
    const rawLayerAttributes = {
            id: attrs.id,
            /**
            * @deprecated in the next major-release!
            * useProxy
            * getProxyUrl()
            */
            url: attrs.useProxy ? getProxyUrl(attrs.url) : attrs.url,
            clusterDistance: attrs.clusterDistance,
            featureNS: attrs.featureNS,
            featureType: attrs.featureType,
            version: attrs.version
        },
        layerParams = {
            name: attrs.name,
            typ: attrs.typ,
            gfiAttributes: attrs.gfiAttributes,
            gfiTheme: attrs.gfiTheme,
            hitTolerance: attrs.hitTolerance,
            altitudeMode: attrs.altitudeMode,
            alwaysOnTop: attrs.alwaysOnTop,
            layerSequence: attrs.layerSequence,
            renderer: attrs.renderer, // use "default" (canvas) or "webgl" renderer
            styleId: attrs.styleId, // styleId to pass to masterportalapi
            style: attrs.style, // style function to style the layer or WebGLPoints style syntax
            excludeTypesFromParsing: attrs.excludeTypesFromParsing, // types that should not be parsed from strings, only necessary for webgl
            isPointLayer: attrs.isPointLayer, // whether the source will only hold point data, only necessary for webgl
            gfiThemeSettings: attrs.gfiThemeSettings // for accessing additional theme settings
        },
        options = {
            doNotLoadInitially: attrs.doNotLoadInitially,
            wfsFilter: attrs.wfsFilter,
            clusterGeometryFunction: (feature) => {
                // do not cluster invisible features; can't rely on style since it will be null initially
                if (feature.get("hideInClustering") === true) {
                    return null;
                }
                return feature.getGeometry();
            },
            featuresFilter: this.getFeaturesFilterFunction(attrs),
            // If an Object contains a property which holds a Function, the property is called a method.
            // This method, when called, will always have it's this variable set to the Object it is associated with.
            // This is true for both strict and non-strict modes.
            // therefore use [fn].bind(this)
            beforeLoading: function () {
                if (this.get("isSelected") || attrs.isSelected) {
                    LoaderOverlay.show();
                }
            }.bind(this),
            afterLoading: function (features) {
                this.featuresLoaded(attrs.id, features);
                if (this.get("isSelected") || attrs.isSelected) {
                    LoaderOverlay.hide();
                }
            }.bind(this),
            onLoadingError: (error) => {
                console.error("masterportal wfs loading error:", error);
            },
            loadingParams: {
                xhrParameters: attrs.isSecured ? {credentials: "include"} : undefined,
                propertyname: this.getPropertyname(attrs) || undefined,
                // only used if loading strategy is all
                bbox: attrs.bboxGeometry ? attrs.bboxGeometry.getExtent().toString() : undefined
            },
            loadingStrategy: attrs.loadingStrategy === "all" ? all : bbox
        };

    this.layer = wfs.createLayer(rawLayerAttributes, {layerParams, options});
};

/**
 * Returns a function to filter features with.
 * @param {Object} attrs  params of the raw layer
 * @returns {Function} to filter features with
 */
WFSLayer.prototype.getFeaturesFilterFunction = function (attrs) {
    return function (features) {
        // only use features with a geometry
        let filteredFeatures = features.filter(feature => feature.getGeometry() !== undefined);

        if (attrs.bboxGeometry) {
            filteredFeatures = filteredFeatures.filter(
                (feature) => attrs.bboxGeometry.intersectsCoordinate(getCenter(feature.getGeometry().getExtent()))
            );
        }
        return filteredFeatures;
    };
};
/**
 * Returns the propertynames as comma separated string.
 * @param {Object} attrs  params of the raw layer
 * @returns {string} the propertynames as string
 */
WFSLayer.prototype.getPropertyname = function (attrs) {
    let propertyname = "";

    if (Array.isArray(attrs.propertyNames)) {
        propertyname = attrs.propertyNames.join(",");
    }
    return propertyname;
};

/**
 * Initializes the style for this layer. If styleId is set, this is done after vector styles are loaded.
 * @param {Object} attrs  params of the raw layer
 * @returns {void}
 */
WFSLayer.prototype.initStyle = async function (attrs) {
    if (store.getters.styleListLoaded) {
        this.createStyle(attrs);
        this.createLegend(attrs);
    }
    else {
        store.watch((state, getters) => getters.styleListLoaded, value => {
            if (value) {
                this.createStyle(attrs);
                this.createLegend(attrs);
            }
        });
    }
};

/**
 * Creates the style function.
 * @param {Object} attrs  params of the raw layer
 * @returns {void}
 */
WFSLayer.prototype.createStyle = async function (attrs) {
    const styleId = attrs.styleId,
        styleObject = styleList.returnStyleObject(styleId);

    if (styleObject !== undefined) {
        /**
         * Returns style function to style fature.
         * @param {ol.Feature} feature the feature to style
         * @returns {Function} style function to style fature
         */
        const style = (feature) => {
            const feat = feature !== undefined ? feature : this,
                isClusterFeature = typeof feat.get("features") === "function" || typeof feat.get("features") === "object" && Boolean(feat.get("features"));

            return createStyle.createStyle(styleObject, feat, isClusterFeature, Config.wfsImgPath);
        };

        this.setStyle(style);
    }
    else {
        console.warn(i18next.t("common:core.layers.errorHandling.wrongStyleId", {styleId}));
    }
};
/**
 * Returns the style function of this layer to be called with feature.
 * @returns {Object} the style function
 */
WFSLayer.prototype.getStyleFunction = function () {
    return this.get("style");
};
/**
 * Updates the layers source by calling refresh at source. Depending on attribute 'sourceUpdated'.
 * @returns {void}
 */
WFSLayer.prototype.updateSource = function () {
    if (this.get("sourceUpdated") === false) {
        this.set("sourceUpdated", true);
        this.layer.getSource().refresh();
    }
};
/**
 * Creates the legend
 * @returns {void}
 */
WFSLayer.prototype.createLegend = function () {
    const styleObject = styleList.returnStyleObject(this.attributes.styleId),
        rules = styleObject?.rules,
        isSecured = this.attributes.isSecured;
    let legend = this.get("legend");

    /**
     * @deprecated in 3.0.0
     */
    if (this.get("legendURL")) {
        if (this.get("legendURL") === "") {
            legend = true;
        }
        else if (this.get("legendURL") === "ignore") {
            legend = false;
        }
        else {
            legend = this.get("legendURL");
        }
    }

    if (Array.isArray(legend)) {
        this.setLegend(legend);
    }
    else if (styleObject && legend === true) {
        getGeometryTypeFromService.getGeometryTypeFromWFS(rules, this.get("url"), this.get("version"), this.get("featureType"), this.get("styleGeometryType"), isSecured, Config.wfsImgPath,
            (geometryTypes, error) => {
                if (error) {
                    store.dispatch("Alerting/addSingleAlert", "<strong>" + i18next.t("common:modules.vectorStyle.styleObject.getGeometryTypeFromWFSFetchfailed") + "</strong> <br>"
                        + "<small>" + i18next.t("common:modules.vectorStyle.styleObject.getGeometryTypeFromWFSFetchfailedMessage") + "</small>");
                }
                return geometryTypes;
            })
            ?.then(legendInfos => {
                if (styleObject.styleId === "default") {
                    this.setLegend(legendInfos);
                }
                else {
                    const source = this.layer.getSource(),
                        features = source instanceof Cluster ? source.getSource().getFeatures() : source.getFeatures();

                    if (!geometryTypeRequestLayers.includes(this.get("id"))) {
                        geometryTypeRequestLayers.push(this.get("id"));
                    }
                    if (rules[0].conditions !== undefined && features) {
                        const uniqueLegendInformation = this.filterUniqueLegendInfo(features, rules, legendInfos);

                        this.setLegend(uniqueLegendInformation);
                    }
                    else {
                        this.setLegend(legendInfos);
                    }
                }
            });
    }
    else if (typeof legend === "string") {
        this.setLegend([legend]);
    }
};

/**
* Filters unique legend information
* @param {Object} features selected features
* @param {Object} rules  the styleObject rules
* @param {Object} legendInfos styleObject legend information
* @returns {object} uniqueLegendInformation as array
*/
WFSLayer.prototype.filterUniqueLegendInfo = function (features, rules, legendInfos) {
    const rulesKey = Object.keys(rules[0].conditions.properties)[0],
        conditionProperties = [...new Set(features.map(feature => feature.get(rulesKey)))];
    let uniqueLegendInformation = [];

    rules.forEach(rule => {
        const value = String(rule.conditions.properties[rulesKey]);

        if (conditionProperties.includes(value)) {
            const legendInformation = legendInfos.find(legendInfo => legendInfo?.label === (rule.style?.legendValue || value));

            if (typeof legendInformation !== "undefined") {
                uniqueLegendInformation.push(legendInformation);
            }
        }
    });

    if (uniqueLegendInformation.length === 0) {
        uniqueLegendInformation = legendInfos;
    }

    return uniqueLegendInformation;
};

/**
 * Hides all features by setting style= null for all features.
 * @returns {void}
 */
WFSLayer.prototype.hideAllFeatures = function () {
    const layerSource = this.get("layerSource") instanceof Cluster ? this.get("layerSource").getSource() : this.get("layerSource"),
        features = layerSource.getFeatures();

    // optimization - clear and re-add to prevent cluster updates on each change
    layerSource.clear();

    features.forEach((feature) => {
        feature.set("hideInClustering", true);
        feature.setStyle(() => null);
    });

    layerSource.addFeatures(features);
};
/**
 * Shows all features by setting their style.
 * @returns {void}
 */
WFSLayer.prototype.showAllFeatures = function () {
    const collection = this.get("layerSource").getFeatures();

    collection.forEach((feature) => {
        const style = this.getStyleAsFunction(this.get("style"));

        feature.setStyle(style(feature));
    });
};
/**
 * Only shows features that match the given ids.
 * @param {String[]} featureIdList List of feature ids.
 * @returns {void}
 */
WFSLayer.prototype.showFeaturesByIds = function (featureIdList) {
    const layerSource = this.get("layerSource") instanceof Cluster ? this.get("layerSource").getSource() : this.get("layerSource"),
        allLayerFeatures = layerSource.getFeatures(),
        featuresToShow = featureIdList.map(id => layerSource.getFeatureById(id));

    this.hideAllFeatures();
    featuresToShow.forEach(feature => {
        const style = this.getStyleAsFunction(this.get("style"));

        if (feature && feature !== null) {
            feature.set("hideInClustering", false);
            feature.setStyle(style(feature));
        }
    });

    layerSource.addFeatures(allLayerFeatures);
    bridge.resetVectorLayerFeatures(this.get("id"), allLayerFeatures);
};
/**
 * Returns the style as a function.
 * @param {Function|Object} style ol style object or style function.
 * @returns {Function} - style as function.
 */
WFSLayer.prototype.getStyleAsFunction = function (style) {
    if (typeof style === "function") {
        return style;
    }

    return function () {
        return style;
    };
};
/**
 * Sets Style for layer.
 * @returns {void}
 */
WFSLayer.prototype.styling = function () {
    this.layer.setStyle(this.getStyleAsFunction(this.get("style")));
};
