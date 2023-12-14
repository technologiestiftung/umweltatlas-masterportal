import actions from "./actionsNewDatasets";
import mutations from "./mutationsScaleSwitcher";
import getters from "./gettersScaleSwitcher";
import state from "./stateNewDatasets";

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters,
};

