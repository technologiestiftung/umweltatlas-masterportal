import {expect} from "chai";
import sinon from "sinon";
import filterAndReduceLayerList from "../../utils/filterAndReduceLayerList.js";

describe("src/modules/tools/saveSelection/utils/filterAndReduceLayerList.js", () => {
    describe("filterAndReduceLayerList", () => {
        let layer2D_1,
            layer2D_2,
            layer3D;

        beforeEach(() => {
            layer2D_1 = {
                id: "1",
                get: (key) => {
                    if (key === "id") {
                        return "1";
                    }
                    if (key === "isExternal") {
                        return false;
                    }
                    if (key === "typ") {
                        return "WFS";
                    }
                    if (key === "isBaseLayer") {
                        return true;
                    }
                    if (key === "selectionIDX") {
                        return 0;
                    }
                    return true;
                }
            };
            layer2D_2 = {
                id: "2",
                get: (key) => {
                    if (key === "id") {
                        return "2";
                    }
                    if (key === "isExternal") {
                        return false;
                    }
                    if (key === "typ") {
                        return "WMS";
                    }
                    if (key === "isBaseLayer") {
                        return false;
                    }
                    if (key === "selectionIDX") {
                        return 1;
                    }
                    return true;
                }
            };
            layer3D = {
                id: "3",
                get: (key) => {
                    if (key === "id") {
                        return "3";
                    }
                    if (key === "isExternal") {
                        return false;
                    }
                    if (key === "typ") {
                        return "Terrain3D";
                    }
                    if (key === "isBaseLayer") {
                        return false;
                    }
                    if (key === "selectionIDX") {
                        return 11;
                    }
                    return true;
                }
            };
        });


        afterEach(() => {
            sinon.restore();
        });

        it("shall not fail with no arguments", () => {
            const result = filterAndReduceLayerList();

            expect(result).to.be.an("array").and.to.be.empty;
        });
        it("shall return reduced layers, mapMode 2D", () => {
            const layerlist = [
                layer2D_1, layer2D_2, layer3D
            ];
            let result = null;

            result = filterAndReduceLayerList("2D", layerlist);

            expect(result).to.be.an("array").to.have.lengthOf(2);
            expect(result[0]).to.be.deep.equals({
                isVisibleInMap: true,
                transparency: true,
                id: "1",
                selectionIDX: 0,
                isBaseLayer: true
            });
            expect(result[1]).to.be.deep.equals({
                isVisibleInMap: true,
                transparency: true,
                id: "2",
                selectionIDX: 1,
                isBaseLayer: false
            });
        });
        it("shall return reduced layers without layer defined in featureViaURL, mapMode 2D", () => {
            global.Config = {};
            Config.featureViaURL = {};
            Config.featureViaURL.layers = [{id: "1"}];

            const layerlist = [
                layer2D_1, layer2D_2
            ];
            let result = null;

            result = filterAndReduceLayerList("2D", layerlist);

            expect(result).to.be.an("array").to.have.lengthOf(1);
            expect(result[0]).to.be.deep.equals({
                isVisibleInMap: true,
                transparency: true,
                id: "2", selectionIDX: 1,
                isBaseLayer: false
            });
            Config.featureViaURL = undefined;
        });

        it("shall return reduced layers, mapMode 3D", () => {
            const layerlist = [
                layer2D_1, layer2D_2, layer3D
            ];
            let result = null;

            result = filterAndReduceLayerList("3D", layerlist);

            expect(result).to.be.an("array").to.have.lengthOf(3);
            expect(result[0]).to.be.deep.equals({
                isVisibleInMap: true,
                transparency: true,
                id: "1",
                selectionIDX: 0,
                isBaseLayer: true
            });
            expect(result[1]).to.be.deep.equals({
                isVisibleInMap: true,
                transparency: true,
                id: "2",
                selectionIDX: 1,
                isBaseLayer: false
            });
            expect(result[2]).to.be.deep.equals({
                isVisibleInMap: true,
                transparency: true,
                id: "3",
                selectionIDX: 11,
                isBaseLayer: false
            });

        });

    });
});
