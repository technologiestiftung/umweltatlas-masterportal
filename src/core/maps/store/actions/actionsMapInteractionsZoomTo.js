import Cluster from "ol/source/Cluster.js";
import crs from "@masterportal/masterportalapi/src/crs";
import calculateExtent from "../../../../utils/calculateExtent";

export default {
    /**
     * Zoom to a given extent
     * @param {Object} _ store context.
     * @param {Object} payload parameter object.
     * @param {String[]} payload.extent The extent to zoom.
     * @param {Object} payload.options Options for zoom.
     * @param {Number} [payload.options.duration=800] The duration of the animation in milliseconds.
     * @see {@link https://openlayers.org/en/latest/apidoc/module-ol_View-View.html#fit} for more options.
     * @returns {void}
     */
    zoomToExtent (_, {extent, options}) {
        mapCollection.getMapView("2D").fit(extent, {
            size: mapCollection.getMap("2D").getSize(),
            ...Object.assign({duration: 800}, options)
        });
    },

    /**
     * Zoom to features that are filtered by the ids.
     * @param {Object} param store context.
     * @param {Object} param.getters the getters.
     * @param {Object} param.dispatch the dispatch.
     * @param {Object} payload parameter object.
     * @param {String[]} payload.ids The feature ids.
     * @param {String} payload.layerId The layer id.
     * @param {Object} payload.zoomOptions The options for zoom to extent.
     * @param {Object} [payload.map] The parameter to get the map from the map collection.
     * @param {String} [payload.map.mapMode="2D"] The map mode.
     * @returns {void}
     */
    async zoomToFilteredFeatures ({getters, dispatch}, {ids, layerId, zoomOptions}) {
        const layer = await getters.getLayerById({layerId: layerId});

        if (layer?.getSource()) {
            const layerSource = layer.getSource(),
                source = layerSource instanceof Cluster ? layerSource.getSource() : layerSource,
                filteredFeatures = source.getFeatures().filter(feature => ids.indexOf(feature.getId()) > -1),
                calculatedExtent = await calculateExtent(filteredFeatures);

            if (filteredFeatures.length > 0) {
                dispatch("zoomToExtent", {extent: calculatedExtent, options: zoomOptions});
            }
        }
    },

    /**
     * Zoom to a given extent, this function allows to give projection of extent
     * Note: Used in remoteInterface.
     * @param {Object} param store context.
     * @param {Object} param.dispatch the dispatch.
     * @param {Object} payload parameter object.
     * @param {Object} payload.data Contains extent, options as Object and projection.
     * @param {String[]} payload.data.extent The extent to zoom.
     * @param {Object} payload.data.options Options for zoom.
     * @param {string} payload.data.projection The projection from RUL parameter.
     * @returns {void}
     */
    zoomToProjExtent ({dispatch}, {data}) {
        if (Object.values(data).every(val => val !== undefined)) {
            const leftBottom = data.extent.slice(0, 2),
                topRight = data.extent.slice(2, 4),
                transformedLeftBottom = crs.transformToMapProjection(mapCollection.getMap("2D"), data.projection, leftBottom),
                transformedTopRight = crs.transformToMapProjection(mapCollection.getMap("2D"), data.projection, topRight),
                extentToZoom = transformedLeftBottom.concat(transformedTopRight);

            dispatch("zoomToExtent", {extent: extentToZoom, options: data.options});
        }
    }
};
