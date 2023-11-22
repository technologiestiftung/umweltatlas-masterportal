import Layer from "./layer";
import styleList from "@masterportal/masterportalapi/src/vectorStyle/styleList";
import createStyle from "@masterportal/masterportalapi/src/vectorStyle/createStyle";
import getGeometryTypeFromService from "@masterportal/masterportalapi/src/vectorStyle/lib/getGeometryTypeFromService";
import store from "../../app-store";
import * as bridge from "./RadioBridge.js";
import Cluster from "ol/source/Cluster";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";

/**
 * Creates a layer of type vectorBase.
 * @param {Object} attrs  attributes of the layer
 * @returns {void}
 */
export default function VectorBaseLayer (attrs) {
    const defaults = {
        supported: ["2D", "3D"],
        isClustered: false,
        altitudeMode: "clampToGround",
        useProxy: false,
        sourceUpdated: false
    };

    this.createLayer(Object.assign(defaults, attrs));

    Layer.call(this, Object.assign(defaults, attrs), this.layer, !attrs.isChildLayer);
    this.createLegend();
}

VectorBaseLayer.prototype = Object.create(Layer.prototype);

/**
 * Creates an vector Base
 * @param {Object} attrs  attributes of the layer
 * @returns {Object} layer
 */
VectorBaseLayer.prototype.createVectorLayer = function (attrs) {
    const source = new VectorSource({
        features: attrs.features
    });

    return new VectorLayer({
        source: source,
        name: attrs.name,
        typ: attrs.typ,
        gfiAttributes: attrs.gfiAttributes,
        id: attrs.id
    });
};

/**
 * creates the layer
 * @param {Object} attr the attributes for the layer
 * @returns {void}
 */
VectorBaseLayer.prototype.createLayer = function (attr) {
    this.layer = this.createVectorLayer(attr);

    this.features = attr.features;
};

/**
 * Updates the layers source
 * @returns {void}
 */
VectorBaseLayer.prototype.updateSource = function () {
    if (this.get("sourceUpdated") === false) {
        this.set("sourceUpdated", true);
        this.layer.getSource().refresh();
    }
};

/**
 * Creates the legend
 * @returns {void}
 */
VectorBaseLayer.prototype.createLegend = function () {
    const styleObject = styleList.returnStyleObject(this.get("styleId")),
        rules = styleObject?.rules;
    let legend = this.get("legend");

    /**
     * @deprecated in 3.0.0
     */
    if (this.get("legendURL")) {
        if (this.get("legendURL") === "" || this.get("legendURL") === "ignore") {
            legend = false;
        }
        else {
            legend = this.get("legendURL");
        }
    }

    if (styleObject && legend === true) {
        createStyle.returnLegendByStyleId(styleObject.styleId).then(legendInfos => {
            if (styleObject.styleId === "default") {
                this.setLegend(legendInfos.legendInformation);
            }
            else {
                getGeometryTypeFromService.getGeometryTypeFromWFS(rules, this.get("url"), this.get("version"), this.get("featureType"), this.get("styleGeometryType"), false, Config.wfsImgPath,
                    (geometryTypes, error) => {
                        if (error) {
                            store.dispatch("Alerting/addSingleAlert", "<strong>" + i18next.t("common:modules.vectorStyle.styleObject.getGeometryTypeFromWFSFetchfailed") + "</strong> <br>"
                                + "<small>" + i18next.t("common:modules.vectorStyle.styleObject.getGeometryTypeFromWFSFetchfailedMessage") + "</small>");
                        }
                        return geometryTypes;
                    });
            }
            this.setLegend(legendInfos.legendInformation);
        });
    }
    else if (typeof legend === "string") {
        this.setLegend([legend]);
    }
};

/**
 * Only shows features that match the given ids.
 * @param {String[]} featureIdList List of feature ids.
 * @returns {void}
 */
VectorBaseLayer.prototype.showFeaturesByIds = function (featureIdList) {
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
 * Hides all features by setting style= null for all features.
 * @returns {void}
 */
VectorBaseLayer.prototype.hideAllFeatures = function () {
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
VectorBaseLayer.prototype.showAllFeatures = function () {
    const collection = this.get("layerSource").getFeatures();

    collection.forEach((feature) => {
        feature.setStyle(undefined);
    });
};

/**
 * Returns the style as a function.
 * @param {Function|Object} style ol style object or style function.
 * @returns {Function} - style as function.
 */
VectorBaseLayer.prototype.getStyleAsFunction = function (style) {
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
VectorBaseLayer.prototype.styling = function () {
    this.layer.setStyle(this.getStyleAsFunction(this.get("style")));
};

