import store from "../../../../../../../app-store";
import {expect} from "chai";
import routingOrsAvoidOption from "../../../../utils/avoidoptions/routing-ors-avoidoptions";

describe("should routingOrsAvoidOptions", () => {
    it("should lowercase preferences from configJson", async () => {
        store.state.configJson = {
            Portalconfig: {
                menu: {
                    tools: {
                        children: {
                            routing: {
                                directionsSettings: {
                                    customAvoidFeatures: {
                                        CYCLING: ["UNPAVEDROADS", "STEPS"]
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };
        const result = routingOrsAvoidOption("UNPAVEDROADS", "CYCLING");

        expect(result).to.eql("unpavedroads");
        store.state.configJson.Portalconfig.menu.tools.children.routing.directionsSettings.customAvoidFeatures = undefined;
    });
    it("should lowercase preferences without configJson", async () => {
        const result = routingOrsAvoidOption("STEPS", "CYCLING");

        expect(result).to.eql("steps");
    });
});
