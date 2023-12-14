import { generateSimpleGetters } from "../../../../app-store/utils/generators";
import scaleSwitcherState from "./stateNewDatasets";

const getters = {
    ...generateSimpleGetters(scaleSwitcherState),

    // NOTE overwrite getters here if you need a special behaviour in a getter
};

export default getters;

