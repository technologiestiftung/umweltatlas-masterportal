import {expect} from "chai";
import sinon from "sinon";
import buildCesiumImageLayer from "../../../utils/buildCesiumImageLayer";

describe("buildCesiumImageLayer", () => {
    afterEach(() => {
        sinon.restore();
    });

    describe("takeOl3DScreenshot", () => {
        it("should return a rejected promise", async () => {
            const scene = {
                events: [],
                postRender: {
                    addEventListener: (evt) => {
                        scene.events.push(evt);
                    }
                },
                requestRender: () => {
                    scene.events[0]();
                }
            };

            await buildCesiumImageLayer.takeOl3DScreenshot(scene).catch(e => {
                expect(e instanceof Error).to.be.true;
            });
        });
        it("should return a resolved promise", async () => {
            const scene = {
                events: [],
                postRender: {
                    addEventListener: (evt) => {
                        scene.events.push(evt);
                        return () => sinon.stub();
                    }
                },
                requestRender: () => {
                    scene.events[0]();
                },
                canvas: {
                    toDataURL: () => "foo"
                }
            };

            await buildCesiumImageLayer.takeOl3DScreenshot(scene).then(result => {
                expect(result).to.be.equal("foo");
            });
        });
        it("should return promise with expected result", async () => {
            const scene = {
                events: [],
                postRender: {
                    addEventListener: (evt) => {
                        scene.events.push(evt);
                        return () => sinon.stub();
                    }
                },
                requestRender: () => {
                    scene.events[0]();
                },
                canvas: document.createElement("canvas").getContext("2d")
            };

            await buildCesiumImageLayer.takeOl3DScreenshot(scene, {width: 0, height: 0}).then(result => {
                expect(result).to.be.equal("data:,");
            });
        });
    });

    describe("createFakeExtent", () => {
        it("should return expected array", () => {
            const view = {
                    getResolution: () => 1,
                    getCenter: () => [1, 1]
                },
                pixels = [1, 1],
                result = [
                    0.5,
                    0.5,
                    1.5,
                    1.5
                ];

            expect(buildCesiumImageLayer.createFakeExtent(view, pixels)).to.deep.equal(result);
        });
    });

    describe("createMapfishPrintImageLayerFromCesium", () => {
        it("should return mapfish print dialog as expected", async () => {
            const ol3d = {
                    getOlMap: () => {
                        return {
                            getView: () => {
                                return {
                                    getResolution: () => 1,
                                    getCenter: () => [1, 1]
                                };
                            }
                        };
                    },
                    getCesiumScene: () => {
                        const scene = {
                            events: [],
                            postRender: {
                                addEventListener: (evt) => {
                                    scene.events.push(evt);
                                    return () => sinon.stub();
                                }
                            },
                            requestRender: () => {
                                scene.events[0]();
                            },
                            canvas: document.createElement("canvas").getContext("2d")
                        };

                        return scene;
                    }
                },
                expected = {
                    type: "image",
                    name: "Cesium",
                    opacity: 1,
                    imageFormat: "image/png",
                    extent: [1, 1, 1, 1],
                    baseURL: "data:,"
                };

            expect(await buildCesiumImageLayer.createMapfishPrintImageLayerFromCesium(ol3d, {width: 0, height: 0})).to.deep.equal(expected);
        });
    });
});
