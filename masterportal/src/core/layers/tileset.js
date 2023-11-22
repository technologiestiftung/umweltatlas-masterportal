import store from "../../app-store";
import {Tileset} from "@masterportal/masterportalapi/src";
import styleList from "@masterportal/masterportalapi/src/vectorStyle/styleList";
import createStyle from "@masterportal/masterportalapi/src/vectorStyle/createStyle";
import getProxyUrl from "../../../src/utils/getProxyUrl";
import * as bridge from "./RadioBridge.js";
import Layer from "./layer";

const hiddenObjects = [],
    lastUpdatedSymbol = Symbol("_lastUpdated");

export {lastUpdatedSymbol, hiddenObjects};

/**
 * Creates a tileset-layer to display on 3D-map.
 * @param {Object} attrs  attributes of the layer
 * @returns {void}
 */
export default function TileSetLayer (attrs) {
    const defaults = {
        supported: ["3D"],
        showSettings: false,
        useProxy: false,
        cesium3DTilesetDefaults: {
            maximumScreenSpaceError: "6"
        },
        hiddenObjects: {},
        featureVisibilityLastUpdated: Date.now()
    };

    /**
     * @deprecated in the next major-release!
     * useProxy
     * getProxyUrl()
     */
    if (attrs.useProxy) {
        attrs.url = getProxyUrl(this.get("url"));
    }
    this.createLayer(Object.assign(defaults, attrs));
    // call the super-layer
    Layer.call(this, Object.assign(defaults, attrs), this.layer, !attrs.isChildLayer);
    this.onMapModeChanged();
    // Hides features by id if config param has "hiddenFeatures"
    if (attrs.hiddenFeatures && attrs.isSelected === true) {
        this.hideObjects(attrs.hiddenFeatures);
    }
    this.layer.tileset?.tileVisible?.addEventListener(this.applyStyle.bind(this));

}
// Link prototypes and add prototype methods, means TileSetLayer uses all methods and properties of Layer
TileSetLayer.prototype = Object.create(Layer.prototype);

/**
 * Creates the layer and if attr.isSelected = true, the layer is set visible.
 * @param {Object} attr the attributes for the layer
 * @returns {void}
 */
TileSetLayer.prototype.createLayer = function (attr) {
    this.layer = new Tileset(attr);
};

/**
 * Calls the function setIsSelected.
 * @param {boolean} newValue if true, layer is selected
 * @returns {void}
 */
TileSetLayer.prototype.setVisible = function (newValue) {
    this.setIsSelected(newValue);
};

/**
 * hides a number of objects called in planing.js
 * @param {Array<string>} toHide A list of Object Ids which will be hidden
 * @param {Boolean} allLayers if true, updates all layers (required to dynamically change visibility of objects contained in multiple tileset layers)
 * @return {void}
 */
TileSetLayer.prototype.hideObjects = function (toHide, allLayers = false) {
    let updateLayer = allLayers;

    toHide.forEach((id) => {
        if (!hiddenObjects[id]) {
            hiddenObjects[id] = new Set();
            updateLayer = true;
        }
    });
    this.setHiddenObjects(hiddenObjects);
    if (updateLayer) {
        this.setFeatureVisibilityLastUpdated(Date.now());
    }
};

/**
 * Show a number of objects.
 * @param {String[]} unHide A list of Object Ids which will be unHidden.
 * @return {void}
 */
TileSetLayer.prototype.showObjects = function (unHide) {
    unHide.forEach((id) => {
        if (hiddenObjects[id]) {
            hiddenObjects[id].forEach((f) => {
                if (f instanceof Cesium.Cesium3DTileFeature || f instanceof Cesium.Cesium3DTilePointFeature) {
                    if (this.featureExists(f)) {
                        f.show = true;
                    }
                }
            });
            delete hiddenObjects[id];
        }
    });
};

/**
 * Checks if a feature is still valid and not already destroyed.
 * @param {Cesium.Cesium3DTileFeature|Cesium.Cesium3DTilePointFeature} feature Cesium feature.
 * @return {Boolean} Feature exists
 */
TileSetLayer.prototype.featureExists = function (feature) {
    return feature &&
        feature.content &&
        !feature.content.isDestroyed() &&
        !feature.content.batchTable.isDestroyed();
};

/**
 * Sets this layer to visible, if mode changes to 3D.
 * @returns {void}
 */
TileSetLayer.prototype.onMapModeChanged = function () {
    store.watch((state, getters) => getters["Maps/mode"], mode => {
        if (mode === "3D") {
            this.setIsSelected(this.get("isVisibleInMap"));
        }
    });
};

/**
 * Calls masterportalAPI's terrain-layer to set this layer visible.
 * @param {Boolean} newValue if true, layer is visible
 * @param {Object} attr the attributes for the layer
 * @returns {void}
 */
TileSetLayer.prototype.setIsSelected = function (newValue, attr) {
    const map = mapCollection.getMap(store.getters["Maps/mode"]),
        treeType = store.getters.treeType;

    if (map && map.mode === "3D") {
        let isVisibleInMap = this.attributes ? this.get("isVisibleInMap") : false;

        if (!this.attributes && attr) {
            isVisibleInMap = attr.isVisibleInMap;
            attr.isVisibleInMap = newValue;
            attr.isSelected = newValue;
            this.layer.setVisible(newValue, map);
        }
        else {
            this.setIsVisibleInMap(newValue);
            this.attributes.isSelected = newValue;
        }
        if (isVisibleInMap) {
            this.createLegend();
        }
        if (treeType !== "light" || store.state.mobile) {
            bridge.updateLayerView(this);
            bridge.renderMenu();
        }
        // We need to hide all features from all visible layers again.
        if (this.get("isSelected") === true && this.has("hiddenFeatures")) {
            const tileSetModels = Radio.request("ModelList", "getModelsByAttributes", {typ: "TileSet3D"});

            tileSetModels.forEach(model => model.hideObjects(this.get("hiddenFeatures")));
        }
        else if (this.get("isSelected") === false && this.has("hiddenFeatures")) {
            this.showObjects(this.get("hiddenFeatures"));
        }
    }
};

/**
 * Is called if a tile visibility event is called from the cesium tileset. Checks for Content Type and calls
 * styleContent.
 * @param {Tile} tile CesiumTile
 * @returns {void}
 */
TileSetLayer.prototype.applyStyle = function (tile) {
    if (tile.content instanceof Cesium.Composite3DTileContent) {
        for (let i = 0; i < tile.content.innerContents.length; i++) {
            this.styleContent(tile.content.innerContents[i]);
        }
    }
    else {
        this.styleContent(tile.content);
    }
};

/**
 * Sets the current LayerStyle on the CesiumTilesetFeatures in the Tile.
 * @param {Cesium.Cesium3DTileContent} content The content for Tile.
 * @return {void}
 */
TileSetLayer.prototype.styleContent = function (content) {
    if (
        !content[lastUpdatedSymbol] ||
        content[lastUpdatedSymbol] < this.get("featureVisibilityLastUpdated")
    ) {
        const batchSize = content.featuresLength;

        for (let batchId = 0; batchId < batchSize; batchId++) {
            const feature = content.getFeature(batchId);

            if (feature) {
                let id = feature.getProperty("id");

                if (!id) {
                    id = `${content.url}${batchId}`;
                }

                if (hiddenObjects[id]) {
                    hiddenObjects[id].add(feature);
                    feature.show = false;
                }
            }
        }
        content[lastUpdatedSymbol] = Date.now();
    }
};

/**
 * Setter for isVisibleInMap and setter for layer.setVisible
 * @param {Boolean} newValue Flag if layer is visible in map
 * @returns {void}
 */
TileSetLayer.prototype.setIsVisibleInMap = function (newValue) {
    const lastValue = this.get("isVisibleInMap"),
        map = mapCollection.getMap(store.getters["Maps/mode"]);

    this.set("isVisibleInMap", newValue);
    if (map && map.mode === "3D") {
        this.layer.setVisible(newValue, map);
    }
    if (lastValue !== newValue) {
        // here it is possible to change the layer visibility-info in state and listen to it e.g. in LegendWindow
        // e.g. store.dispatch("Map/toggleLayerVisibility", {layerId: this.get("id")});
        bridge.layerVisibilityChanged(this, this.get("isVisibleInMap"));
    }
};

/**
 * Creates the legend.
 * @returns {void}
 */
TileSetLayer.prototype.createLegend = function () {
    const styleObject = styleList.returnStyleObject(this.get("styleId"));
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
        createStyle.returnLegendByStyleId(styleObject.styleId).then(legendInfos => {
            const type = this.layer.getSource().getFeatures()[0].getGeometry().getType(),
                typeSpecificLegends = [];

            if (type === "MultiLineString") {
                typeSpecificLegends.push(legendInfos.legendInformation.find(element => element.geometryType === "LineString"));
                this.setLegend(typeSpecificLegends);
            }
            else {
                typeSpecificLegends.push(legendInfos.legendInformation.find(element => element.geometryType === type));
                this.setLegend(typeSpecificLegends);
            }
            this.setLegend(legendInfos.legendInformation);
        });
    }
    else if (typeof legend === "string") {
        this.setLegend([legend]);
    }
};
/**
* Register interaction with map view. Listens to change of scale.
* @returns {void}
*/
TileSetLayer.prototype.registerInteractionMapViewListeners = function () {
    // no listeners shall be registered
};
/**
 * Transforms transparency into opacity and sets opacity on layer.
 * @return {void}
 */
TileSetLayer.prototype.updateLayerTransparency = function () {
    // not needed in 3D
};
/**
 * Setter for transparency and setter for opacitiy of the layer.
 * @param {Number} newValue Tranparency in percent
 * @returns {void}
 */
TileSetLayer.prototype.setTransparency = function () {
    // not needed in 3D
};
/**
 * Sets visible min and max resolution on layer.
 * @returns {void}
 */
TileSetLayer.prototype.setMinMaxResolutions = function () {
    // not needed in 3D
};
/**
 * Checks whether the layer is visible or not based on the scale.
 * @param {object} options - of the map, contains scale of the map
 * @returns {void}
 **/
TileSetLayer.prototype.checkForScale = function () {
    // not needed in 3D
};

/**
 * Setter for hiddenObjects
 * @param {object} value hiddenObjects
 * @returns {void}
 */
TileSetLayer.prototype.setHiddenObjects = function (value) {
    value.forEach(val => {
        hiddenObjects.push(val);
    });
};

/**
 * Setter for featureVisibilityLastUpdated
 * @param {Date} value featureVisibilityLastUpdated
 * @returns {void}
 */
TileSetLayer.prototype.setFeatureVisibilityLastUpdated = function (value) {
    this.set("featureVisibilityLastUpdated", value);
};

TileSetLayer.prototype.setLastUpdatedSymbol = function (value) {
    this.set("lastUpdatedSymbol", value);
};
