import state from "./stateLogin";
import mutations from "./mutationsLogin";
import getters from "./gettersLogin";
import actions from "./actionsLogin";

/**
 * Login state.
 */
export default {
    namespaced: true,
    state,
    mutations,
    getters,
    actions
};
