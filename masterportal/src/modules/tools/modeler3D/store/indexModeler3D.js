import state from "./stateModeler3D";
import actions from "./actionsModeler3D";
import getters from "./gettersModeler3D";
import mutations from "./mutationsModeler3D";

export default {
    namespaced: true,
    state: {...state},
    mutations,
    actions,
    getters
};
