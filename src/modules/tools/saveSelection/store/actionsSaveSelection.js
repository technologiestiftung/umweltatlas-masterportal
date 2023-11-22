import {sortObjects} from "../../../../utils/sortObjects";

const actions = {
    /**
     * Dispatches the action to copy the given element to the clipboard.
     *
     * @param {Element} el element to copy
     * @returns {void}
     */
    copyToClipboard ({dispatch}, el) {
        dispatch("copyToClipboard", el, {root: true});
    },
    /**
     * Retrieves the ids, transparencies and the visibilities of the layers from the layerList
     * and commits it to the state.
     * @param {Array} layerList list of reduced layers
     * @returns {void}
     */
    createUrlParams ({commit}, layerList) {
        const layerTransparencies = [],
            layerVisibilities = [],
            subjectDataLayer = layerList.filter(layer => !layer.isBaseLayer);
        let layers = [],
            baseLayer = layerList.filter(layer => layer.isBaseLayer);

        sortObjects(baseLayer, "selectionIDX");
        // NOTICE strange behaviour: if only baslayers are in urlParams, it must be reversed
        // NOTICE in src_3_0_0 the handling of visible layers uses only zIndex and is handeled in another way, so it doesn't matter why it is strange
        if (subjectDataLayer.length === 0) {
            baseLayer = baseLayer.reverse();
        }
        layers = baseLayer.concat(subjectDataLayer);
        layers.forEach(layerModel => {
            layerTransparencies.push(layerModel.transparency);
            layerVisibilities.push(layerModel.isVisibleInMap);
        });

        commit("setLayerIds", layers.map(el => el.id));
        commit("setLayerTransparencies", layerTransparencies);
        commit("setLayerVisibilities", layerVisibilities);
    }
};

export default actions;
