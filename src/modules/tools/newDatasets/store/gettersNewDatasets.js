import { generateSimpleGetters } from "../../../../app-store/utils/generators";
import newDatasetsState from "./NewDatasets";

const getters = {
    ...generateSimpleGetters(newDatasetsState),

    // NOTE overwrite getters here if you need a special behaviour in a getter
};

export default getters;

