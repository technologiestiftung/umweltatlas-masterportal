import {generateSimpleMutations} from "../../../../app-store/utils/generators";
import modeler3DState from "./stateModeler3D";

const mutations = {
    /**
     * Creates from every state-key a setter.
     * For example, given a state object {key: value}, an object
     * {setKey:   (state, payload) => *   state[key] = payload * }
     * will be returned.
     */
    ...generateSimpleMutations(modeler3DState),
    /**
     * Updates the name of a model in the state.
     * @param {object} state - The state object of the Vuex module.
     * @param {string} name - The new name for the model.
     * @returns {void}
     */
    setModelName: (state, name) => {
        const allModels = state.importedModels.concat(state.drawnModels),
            model = allModels.find(x => x.id === state.currentModelId);

        model.name = name;
    },
    /**
     * Set currect projection to one in the list of projections.
     * @param {Object} state the state of coord-module
     * @param {Object[]} [projections=[]] list of available projections
     * @returns {void}
     */
    setProjections: (state, projections = []) => {
        const found = projections.filter(projection => projection.id === state.currentProjection?.id);

        if (found.length === 0) {
            // EPSG:25832 must be the first one
            const firstProj = projections.find(proj => proj.name.indexOf("25832") > -1);

            if (firstProj) {
                const index = projections.indexOf(firstProj);

                projections.splice(index, 1);
                projections.unshift(firstProj);
            }
            state.currentProjection = projections[0];
        }
        state.projections = projections;
    }
};

export default mutations;
