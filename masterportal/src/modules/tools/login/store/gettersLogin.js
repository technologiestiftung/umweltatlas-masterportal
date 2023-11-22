import stateLogin from "./stateLogin";
import {generateSimpleGetters} from "../../../../app-store/utils/generators";

const gettersMap = {
    ...generateSimpleGetters(stateLogin)
};

export default gettersMap;
