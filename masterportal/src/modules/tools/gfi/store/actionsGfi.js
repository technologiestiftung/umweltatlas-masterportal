import getProxyUrl from "../../../../utils/getProxyUrl";
import {getWmsFeaturesByMimeType} from "../../../../api/gfi/getWmsFeaturesByMimeType";
import {getVisibleWmsLayersAtResolution} from "../utils/getLayers";

let globeEventHandler,
    colored3DTile,
    old3DTileColor;

export default {
/**
     * Updates the click coordinate and the related pixel depending on the map mode.
     * If Gfi Tool is active, the features of this coordinate/pixel are set.
     * @param {Object} param store context
     * @param {Object} param.dispatch the dispatch
     * @returns {void}
     */
    updateClick ({dispatch}) {
        dispatch("collectGfiFeatures");
    },
    /**
     * Function to highlight a 3D Tile with left click.
     * @param {Object} param.getters the getters
     * @param {Object} param.dispatch the dispatch
     * @returns {void}
     */
    highlight3DTile ({getters, dispatch}) {
        const scene = mapCollection.getMap("3D").getCesiumScene();

        globeEventHandler = new Cesium.ScreenSpaceEventHandler(
            scene.canvas
        );

        let highlightColor = Cesium.Color.RED;

        old3DTileColor = null;
        colored3DTile = [];

        if (getters.coloredHighlighting3D?.color !== undefined) {
            const configuredColor = getters.coloredHighlighting3D?.color;

            if (configuredColor instanceof Array) {
                highlightColor = Cesium.Color.fromBytes(configuredColor[0], configuredColor[1], configuredColor[2], configuredColor[3]);
            }
            else if (configuredColor && typeof configuredColor === "string") {
                highlightColor = Cesium.Color[configuredColor];
            }
            else {
                console.warn("The color for the 3D highlighting is not valid. Please check the config or documentation.");
            }
        }

        globeEventHandler.setInputAction(function onLeftClick (
            click
        ) {

            dispatch("removeHighlightColor");

            const pickedFeature = scene.pick(click.position);

            if (pickedFeature) {
                old3DTileColor = pickedFeature?.color;
                colored3DTile.push(pickedFeature);
                pickedFeature.color = highlightColor;
            }
        },
        Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
    /**
     * Function to remove highlighting of a 3D Tile and the event handler.
     * @param {Object} param.dispatch the dispatch
     * @returns {void}
     */
    removeHighlight3DTile ({dispatch}) {
        dispatch("removeHighlightColor");

        if (globeEventHandler !== undefined && globeEventHandler instanceof Cesium.ScreenSpaceEventHandler) {
            globeEventHandler.destroy();
        }
    },
    /**
     * Function to revert the highlight coloring  of a 3D Tile.
     * @returns {void}
     */
    removeHighlightColor () {
        if (Array.isArray(colored3DTile) && colored3DTile.length > 0) {
            colored3DTile[0].color = old3DTileColor;
            colored3DTile = [];
        }
    },
    /**
     * Collects features for the gfi.
     * @param {Object} param store context
     * @param {Object} param.getters the getter
     * @param {Object} param.commit the commit
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.rootGetters the rootGetters
     * @returns {void}
     */
    collectGfiFeatures ({getters, commit, dispatch, rootGetters}) {
        const clickCoordinate = rootGetters["Maps/clickCoordinate"],
            resolution = rootGetters["Maps/resolution"],
            projection = rootGetters["Maps/projection"],
            gfiFeaturesAtPixel = getters.gfiFeaturesAtPixel,
            gfiWmsLayerList = getVisibleWmsLayersAtResolution(resolution).filter(layer => {
                return layer.get("gfiAttributes") !== "ignore";
            });

        Promise.all(gfiWmsLayerList.map(layer => {
            const gfiParams = {
                INFO_FORMAT: layer.get("infoFormat"),
                FEATURE_COUNT: layer.get("featureCount")
            };
            let url = layer.getSource().getFeatureInfoUrl(clickCoordinate, resolution, projection, gfiParams);

            // this part is needed if a Url contains a style which seems to mess up the getFeatureInfo call
            if (url.indexOf("STYLES") && url.indexOf("STYLES=&") === -1) {
                const newUrl = url.replace(/STYLES=.*?&/g, "STYLES=&");

                url = newUrl;
            }

            /**
             * @deprecated in the next major-release!
             * useProxy
             * getProxyUrl()
             */
            url = layer.get("useProxy") ? getProxyUrl(url) : url;

            return getWmsFeaturesByMimeType(layer, url);
        }))
            .then(gfiFeatures => {
                const clickPixel = rootGetters["Maps/clickPixel"],
                    clickCartesianCoordinate = rootGetters["Maps/clickCartesianCoordinate"],
                    mode = rootGetters["Maps/mode"];
                let allGfiFeatures = gfiFeaturesAtPixel(clickPixel, clickCoordinate, clickCartesianCoordinate, mode).concat(...gfiFeatures);

                if (mode === "3D") {
                    allGfiFeatures = allGfiFeatures.reverse();
                }
                // only commit if features found
                if (allGfiFeatures.length > 0) {
                    commit("setGfiFeatures", allGfiFeatures);
                }
                else {
                    commit("setGfiFeatures", null);
                }
            })
            .catch(error => {
                console.warn(error);
                dispatch("Alerting/addSingleAlert", i18next.t("common:modules.tools.gfi.errorMessage"), {root: true});
            });
    }
};
