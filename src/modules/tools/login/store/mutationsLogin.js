import {generateSimpleMutations} from "../../../../app-store/utils/generators";
import initialState from "./stateLogin";


const mutations = {
    ...generateSimpleMutations(initialState)
};

export default mutations;
