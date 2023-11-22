import {expect} from "chai";
import sinon from "sinon";
import mutations from "../../../store/mutationsMouseHover";
import stateMouseHover from "../../../store/stateMouseHover";

describe("src/modules/mouseHover/store/mutationsMouseHover", () => {
    const groupLayer = {
            name: "WFS Gruppenlayer",
            typ: "GROUP",
            children: [{id: "layer1", mouseHoverField: "name"}, {id: "layer2", mouseHoverField: "Schulabschluss"}]
        },
        singleLayer = {
            name: "WFS Einzellayer",
            typ: "WFS",
            id: "singleLayer",
            mouseHoverField: "name"
        };
    let state;

    beforeEach(() => {
        state = {...stateMouseHover};
    });
    afterEach(sinon.restore);

    describe("setMouseHoverLayers", () => {
        it("sets the children layer to state if they have a mouseHoverField", () => {
            sinon.stub(Radio, "request").callsFake((...args) => {
                let ret = null;

                args.forEach(arg => {
                    if (arg === "getItemsByAttributes") {
                        ret = [groupLayer];
                    }
                });
                return ret;
            });
            mutations.setMouseHoverLayers(state);
            mutations.setMouseHoverInfos(state);

            expect(state.mouseHoverLayers).to.eql([{id: "layer1", mouseHoverField: "name"}, {id: "layer2", mouseHoverField: "Schulabschluss"}]);
            expect(state.mouseHoverInfos).to.eql([{id: "layer1", mouseHoverField: "name"}, {id: "layer2", mouseHoverField: "Schulabschluss"}]);
        });
        it("sets a single layer to state if it has a mouseHoverField", () => {
            sinon.stub(Radio, "request").callsFake((...args) => {
                let ret = null;

                args.forEach(arg => {
                    if (arg === "getItemsByAttributes") {
                        ret = [singleLayer];
                    }
                });
                return ret;
            });
            mutations.setMouseHoverLayers(state);
            mutations.setMouseHoverInfos(state);

            expect(state.mouseHoverLayers).to.eql([{
                name: "WFS Einzellayer",
                typ: "WFS",
                id: "singleLayer",
                mouseHoverField: "name"
            }]);
            expect(state.mouseHoverInfos).to.eql([{
                id: "singleLayer",
                mouseHoverField: "name"
            }]);
        });
    });
});
