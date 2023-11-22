import {expect} from "chai";
import Feature from "ol/Feature.js";
import InterfaceVectorTilesIntern from "../../../interfaces/interface.vectortiles.intern";
import sinon from "sinon";
import openlayerFunctions from "../../../utils/openlayerFunctions";
import store from "../../../../../../app-store";

describe("src/modules/tools/filter/interfaces/utils/interface.wfs.intern.js", () => {
    let interfaceVectorTilesIntern = null;

    beforeEach(() => {
        interfaceVectorTilesIntern = new InterfaceVectorTilesIntern(false, {
            getFeaturesByLayerId: false,
            isFeatureInMapExtent: false,
            isFeatureInGeometry: false
        });
    });
    describe("getAttrTypes", () => {
        it("should call onerror function, if layermodel doesn't exist", () => {
            const stubGetLayerByLayerId = sinon.stub(openlayerFunctions, "getLayerByLayerId").returns(null),
                service = {layerId: 1},
                onsuccess = undefined,
                expectedError = new Error("InterfaceVectorTilesIntern.getAttrTypes: cannot find layer model for given layerId 1.");

            interfaceVectorTilesIntern.getAttrTypes(service, onsuccess, error => {
                expect(error).to.deep.equal(expectedError);
                expect(stubGetLayerByLayerId.called).to.be.true;
            });
            sinon.restore();
        });
        it("should call the onsuccess function and return an empty list if no features in current extent", () => {
            sinon.stub(openlayerFunctions, "getLayerByLayerId").returns({
                layer: {
                    getSource: () => {
                        return {
                            getFeaturesInExtent: () => []
                        };
                    }
                }
            });

            store.getters = {
                "Maps/getCurrentExtent": () => sinon.stub()
            };
            interfaceVectorTilesIntern.getAttrTypes({}, attrTypes => {
                expect(attrTypes).to.deep.equal({});
            }, undefined);
            sinon.restore();
        });
        it("should call the onsuccess function with expected result", () => {
            sinon.stub(openlayerFunctions, "getLayerByLayerId").returns({
                layer: {
                    getSource: () => {
                        return {
                            getFeaturesInExtent: () => [
                                new Feature({foo: 10, fow: "wow"}),
                                new Feature({fof: "10", flw: "wow"}),
                                new Feature({fee: true, fuu: null})
                            ]
                        };
                    }
                }
            });
            store.getters = {
                "Maps/getCurrentExtent": () => sinon.stub()
            };
            const expected = {
                foo: "number",
                fow: "string",
                fof: "number",
                flw: "string",
                fee: "boolean",
                fuu: "string"
            };

            interfaceVectorTilesIntern.getAttrTypes({}, attrTypes => {
                expect(attrTypes).to.deep.equal(expected);
            }, undefined);
            sinon.restore();
        });
    });
    describe("getMinMax", () => {
        it("should call onerror function, if layermodel doesn't exist", () => {
            const stubGetLayerByLayerId = sinon.stub(openlayerFunctions, "getLayerByLayerId").returns(null),
                service = {layerId: 1},
                attrName = "foo",
                onsuccess = undefined,
                expectedError = new Error("InterfaceVectorTilesIntern.getMinMax: cannot find layer model for given layerId 1.");

            interfaceVectorTilesIntern.getMinMax(service, attrName, onsuccess, error => {
                expect(error).to.deep.equal(expectedError);
                expect(stubGetLayerByLayerId.called).to.be.true;
            }, false, false);
            sinon.restore();
        });
        it("should call the onsuccess function with {min: false, max:false} param, if no features exists in current extent.", () => {
            sinon.stub(openlayerFunctions, "getLayerByLayerId").returns({
                layer: {
                    getSource: () => {
                        return {
                            getFeaturesInExtent: () => []
                        };
                    }
                }
            });

            store.getters = {
                "Maps/getCurrentExtent": () => sinon.stub()
            };

            const service = {layerId: 1},
                attrName = "foo",
                onerror = undefined,
                expectedObj = {min: false, max: false};

            interfaceVectorTilesIntern.getMinMax(service, attrName, minMaxObj => {
                expect(minMaxObj).to.deep.equal(expectedObj);
            }, onerror, false, false);
            sinon.restore();
        });
        it("should call onsuccess with expected min max result", () => {
            sinon.stub(openlayerFunctions, "getLayerByLayerId").returns({
                layer: {
                    getSource: () => {
                        return {
                            getFeaturesInExtent: () => [
                                new Feature({foo: 10, fow: "wow"}),
                                new Feature({foo: 10, fow: "wow"}),
                                new Feature({foo: 30, fow: "wow"}),
                                new Feature({foo: 15, fow: "wow"})
                            ]
                        };
                    }
                }
            });

            store.getters = {
                "Maps/getCurrentExtent": () => sinon.stub()
            };

            const service = {layerId: 1},
                attrName = "foo",
                onerror = undefined,
                expectedObj = {min: 10, max: 30};

            interfaceVectorTilesIntern.getMinMax(service, attrName, minMaxObj => {
                expect(minMaxObj).to.deep.equal(expectedObj);
            }, onerror, true, true);
            sinon.restore();
        });
    });
    describe("getUniqueValues", () => {
        it("should call onerror function, if layermodel doesn't exist", () => {
            const stubGetLayerByLayerId = sinon.stub(openlayerFunctions, "getLayerByLayerId").returns(null),
                service = {layerId: 1},
                attrName = "foo",
                onsuccess = undefined,
                expectedError = new Error("InterfaceVectorTilesIntern.getUniqueValues: cannot find layer model for given layerId 1.");

            interfaceVectorTilesIntern.getUniqueValues(service, attrName, onsuccess, error => {
                expect(error).to.deep.equal(expectedError);
                expect(stubGetLayerByLayerId.called).to.be.true;
            });
            sinon.restore();
        });
        it("should call the onsuccess function, even if no features exists in current extent.", () => {
            sinon.stub(openlayerFunctions, "getLayerByLayerId").returns({
                layer: {
                    getSource: () => {
                        return {
                            getFeaturesInExtent: () => []
                        };
                    }
                }
            });

            store.getters = {
                "Maps/getCurrentExtent": () => sinon.stub()
            };

            const service = {layerId: 1},
                attrName = "foo",
                onerror = undefined,
                expected = [];

            interfaceVectorTilesIntern.getUniqueValues(service, attrName, uniqueValues => {
                expect(uniqueValues).to.deep.equal(expected);
            }, onerror);
            sinon.restore();
        });
        it("should return unique values if features exists", () => {
            sinon.stub(openlayerFunctions, "getLayerByLayerId").returns({
                layer: {
                    getSource: () => {
                        return {
                            getFeaturesInExtent: () => [
                                new Feature({foo: "bar", fow: "wow"}),
                                new Feature({foo: "baz", fow: "wow"}),
                                new Feature({foo: "bar", fow: "wow"})
                            ]
                        };
                    }
                }
            });
            store.getters = {
                "Maps/getCurrentExtent": () => sinon.stub()
            };

            const service = {layerId: 1},
                attrName = "foo",
                onerror = undefined,
                expected = ["bar", "baz"];

            interfaceVectorTilesIntern.getUniqueValues(service, attrName, uniqueValues => {
                expect(uniqueValues).to.deep.equal(expected);
            }, onerror);
            sinon.restore();
        });
    });
    describe("filterGivenFeatures", () => {
        it("should start the filtering process and return the expected items", () => {
            const feature = new Feature({"foo": "bar"});

            interfaceVectorTilesIntern = new InterfaceVectorTilesIntern({
                startPagingInterval: (filterId, onsuccess) => {
                    onsuccess();
                },
                stopPagingInterval: sinon.stub()
            }, {
                getFeaturesByLayerId: false,
                isFeatureInMapExtent: false,
                isFeatureInGeometry: false
            });
            interfaceVectorTilesIntern.filterGivenFeatures([feature],
                0,
                0,
                {},
                {"snippetId": 0, "startup": false, "fixed": false, "attrName": "foo", "operator": "EQ", "value": ["bar"]},
                undefined,
                false,
                10000,
                () => {
                    expect({
                        service: {},
                        filterId: 0,
                        snippetId: 0,
                        paging: {
                            page: 1,
                            total: 1
                        },
                        items: [feature]
                    });
                });
            sinon.restore();
        });
    });
});
