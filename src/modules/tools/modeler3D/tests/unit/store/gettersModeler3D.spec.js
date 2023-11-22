import {expect} from "chai";
import getters from "../../../store/gettersModeler3D";
import Modeler3DState from "../../../store/stateModeler3D";

describe("src/modules/tools/modeler3D/store/gettersModeler3D.js", () => {
    let state;

    describe("getters Modeler3D", () => {
        beforeEach(() => {
            state = Modeler3DState;
        });
        it("returns the model name from id", () => {
            state.importedModels = [{id: "someId", name: "someName"}];

            expect(getters.getModelNameById(state)("someId")).to.equals("someName");
        });

        it("returns the projection by id", () => {
            const projection = {id: "someId", epsg: "someEpsg"};

            state.projections = [projection];

            expect(getters.getProjectionById(state)("someId")).to.equals(projection);
        });

        it("returns a value to increment or decrement by", () => {
            state.currentProjection = {epsg: "someEpsg"};

            expect(getters.coordAdjusted(state)({shift: true, coordType: "longitude"})).to.equals(1);
        });

        describe("formatCoord", () => {
            it("returns a formatted float from EPSG:4326", () => {
                const coord = "9° 59′ 42″";

                state.currentProjection = {projName: "longlat"};

                expect(getters.formatCoord(state)(coord)).to.equals(9.995);
            });

            it("returns a formatted float from decimal EPSG:4326", () => {
                const coord = "9.999°";

                state.currentProjection = {id: "http://www.opengis.net/gml/srs/epsg.xml#4326-DG"};

                expect(getters.formatCoord(state)(coord)).to.equals(9.999);
            });

            it("returns a formatted float from default format", () => {
                const coord = "9.999";

                state.currentProjection = {};

                expect(getters.formatCoord(state)(coord)).to.equals(9.999);
            });
        });

        describe("prettyCoord", () => {
            const coord = 9.995;

            it("returns a formatted float to EPSG:4326", () => {
                state.currentProjection = {projName: "longlat"};

                expect(getters.prettyCoord(state)(coord)).to.equals("9° 59′ 41″");
            });

            it("returns a formatted float to decimal EPSG:4326", () => {
                state.currentProjection = {id: "http://www.opengis.net/gml/srs/epsg.xml#4326-DG"};

                expect(getters.prettyCoord(state)(coord)).to.equals("9.995000°");
            });

            it("returns a formatted float to default format", () => {
                state.currentProjection = {};

                expect(getters.prettyCoord(state)(coord)).to.equals("9.99");
            });
        });

        it("returns the center of a polygon", () => {
            const polygon = {
                polygon: {
                    hierarchy: {
                        getValue: () => ({positions: [{x: 10, y: 20, z: 30}, {x: 20, y: 30, z: 10}, {x: 30, y: 10, z: 20}]})
                    }
                }
            };

            global.Cesium = {
                Cartesian3: {
                    add: (pos1, pos2, res) => {
                        res.x = pos1.x + pos2.x;
                        res.y = pos1.y + pos2.y;
                        res.z = pos1.z + pos2.z;
                        return res;
                    },
                    divideByScalar: (pos, num, res) => {
                        res.x = pos.x / num;
                        res.y = pos.y / num;
                        res.z = pos.z / num;
                        return res;
                    }
                }
            };

            expect(getters.getCenterFromGeometry()(polygon)).to.eql({x: 20, y: 20, z: 20});
        });
    });
});
