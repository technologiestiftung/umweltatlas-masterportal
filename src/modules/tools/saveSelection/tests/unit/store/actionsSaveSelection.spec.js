import actions from "../../../store/actionsSaveSelection";
import sinon from "sinon";
import {expect} from "chai";

describe("src/modules/tools/saveSelection/store/actionsSaveSelection.js", () => {
    let commit,
        layer1,
        layer2,
        layer3;

    beforeEach(() => {
        commit = sinon.spy();
        layer1 = {
            isVisibleInMap: true,
            transparency: true,
            id: "1",
            selectionIDX: 0,
            isBaseLayer: true
        };
        layer2 = {
            isVisibleInMap: true,
            transparency: true,
            id: "2",
            selectionIDX: 1,
            isBaseLayer: true
        };
        layer3 = {
            isVisibleInMap: false,
            transparency: false,
            id: "3",
            selectionIDX: 2,
            isBaseLayer: false
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("saveSelection actions", () => {
        it("createUrlParams with empty layerlist", () => {

            actions.createUrlParams({commit}, []);
            expect(commit.calledThrice).to.be.true;
            expect(commit.firstCall.args[0]).to.equal("setLayerIds");
            expect(commit.firstCall.args[1]).to.deep.equal([]);
            expect(commit.secondCall.args[0]).to.equal("setLayerTransparencies");
            expect(commit.secondCall.args[1]).to.deep.equal([]);
            expect(commit.thirdCall.args[0]).to.equal("setLayerVisibilities");
            expect(commit.thirdCall.args[1]).to.deep.equal([]);
        });

        it("createUrlParams with only baselayers", () => {
            const layerList = [layer1, layer2];

            actions.createUrlParams({commit}, layerList);
            expect(commit.calledThrice).to.be.true;
            expect(commit.firstCall.args[0]).to.equal("setLayerIds");
            // NOTICE: strange behaviour: if only baslayers are in urlParams, it must be reversed
            // NOTICE in src_3_0_0 test must change!
            expect(commit.firstCall.args[1]).to.deep.equal(["2", "1"]);
            expect(commit.secondCall.args[0]).to.equal("setLayerTransparencies");
            expect(commit.secondCall.args[1]).to.deep.equal([true, true]);
            expect(commit.thirdCall.args[0]).to.equal("setLayerVisibilities");
            expect(commit.thirdCall.args[1]).to.deep.equal([true, true]);
        });

        it("createUrlParams with subject data and base layers", () => {
            const layerList = [layer1, layer2, layer3];

            actions.createUrlParams({commit}, layerList);
            expect(commit.calledThrice).to.be.true;
            expect(commit.firstCall.args[0]).to.equal("setLayerIds");
            expect(commit.firstCall.args[1]).to.deep.equal(["1", "2", "3"]);
            expect(commit.secondCall.args[0]).to.equal("setLayerTransparencies");
            expect(commit.secondCall.args[1]).to.deep.equal([true, true, false]);
            expect(commit.thirdCall.args[0]).to.equal("setLayerVisibilities");
            expect(commit.thirdCall.args[1]).to.deep.equal([true, true, false]);
        });

    });
});

