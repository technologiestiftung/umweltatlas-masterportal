import Vuex from "vuex";
import {expect} from "chai";
import sinon from "sinon";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import Modeler3DDrawComponent from "../../../components/Modeler3DDraw.vue";
import Modeler3D from "../../../store/indexModeler3D";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/tools/modeler3D/components/Modeler3DDraw.vue", () => {
    const globalURL = global.URL,
        mockMapGetters = {
            mouseCoordinate: () => {
                return [11.549606597773037, 48.17285700012215];
            }
        },
        Cartesian3Coordinates = {
            x: 3739310.9273738265,
            y: 659341.4057539968,
            z: 5107613.232959453
        },
        pickRayResult = {
            origin: {},
            direction: {}
        },
        entity = {
            id: "1",
            orientation: null,
            position: {
                getValue: () => {
                    return {x: 100, y: 100, z: 100};
                }
            },
            model: {scale: 1}
        },
        entities = {
            getById: () => entity,
            values: [{id: "FloatingPointId", positionIndex: 0, cylinder: {length: 4}}],
            add: () => entity
        },
        map3D = {
            id: "1",
            mode: "3D",
            getCesiumScene: () => {
                return scene;
            },
            getDataSourceDisplay: () => {
                return {
                    defaultDataSource: {
                        entities: entities
                    }
                };
            },
            getOlMap: () => ({
                getView: () => ({
                    getProjection: () => ({
                        getCode: () => "EPSG:25832"
                    })
                })
            })
        };

    let store,
        originalCreateCylinder,
        wrapper,
        scene;

    beforeEach(() => {
        global.URL = {
            createObjectURL: sinon.stub(),
            revokeObjectURL: sinon.stub()
        };
        originalCreateCylinder = Modeler3D.actions.createCylinder;
        Modeler3D.actions.createCylinder = sinon.spy();
        mapCollection.clear();
        mapCollection.addMap(map3D, "3D");

        entities.add = sinon.stub();

        scene = {
            camera: {
                getPickRay: sinon.stub().returns(pickRayResult),
                flyTo: sinon.spy()
            },
            globe: {
                pick: sinon.stub().returns({}),
                getHeight: sinon.stub().returns(5)
            },
            sampleHeight: sinon.stub().returns(5)
        };

        global.Cesium = {
            Color: {
                fromBytes: sinon.stub().returns({
                    withAlpha: sinon.stub()
                })
            },
            CallbackProperty: sinon.stub(),
            ColorMaterialProperty: sinon.stub(),
            ShadowMode: {
                ENABLED: 1
            },
            defined: sinon.stub().returns(true),
            Cartesian3: {
                equals: sinon.stub().returns(false)
            },
            Math: {
                toDegrees: () => 9.99455657887449
            },
            Cartographic: {
                toCartesian: () => ({
                    x: 3739310.9273738265,
                    y: 659341.4057539968,
                    z: 5107613.232959453
                }),
                fromDegrees: () => ({
                    longitude: 0.17443853256965697,
                    latitude: 0.9346599366554966,
                    height: 6.134088691520464
                }),
                fromCartesian: () => ({
                    longitude: 0.17443853256965697,
                    latitude: 0.9346599366554966,
                    height: 6.134088691520464
                })
            }
        };
        global.Cesium.HeightReference = {
            NONE: 0
        };

        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        Modeler3D
                    }
                },
                Maps: {
                    namespaced: true,
                    getters: mockMapGetters
                }
            }
        });
        wrapper = shallowMount(Modeler3DDrawComponent, {store, localVue});

        store.commit("Tools/Modeler3D/setActive", true);
        store.commit("Tools/Modeler3D/setCurrentView", "draw");
        store.commit("Tools/Modeler3D/setCylinderId", "FloatingPointId");
    });

    afterEach(() => {
        Modeler3D.actions.createCylinder = originalCreateCylinder;
        sinon.restore();
        if (wrapper) {
            wrapper.destroy();
        }
        entities.values = [{id: "FloatingPointId", positionIndex: 0, cylinder: {length: 4}}];
        global.URL = globalURL;
    });

    describe("renders Modeler3DDraw", async () => {
        expect(wrapper.find("#modeler3D-draw-tool").exists()).to.be.true;
        expect(wrapper.find("#tool-modeler3D-geometry").exists()).to.be.true;
        expect(wrapper.find("#modeler3D-draw-name").exists()).to.be.true;
        expect(wrapper.find("#tool-modeler3D-transparency").exists()).to.be.true;
        expect(wrapper.find("#clampToGroundSwitch").exists()).to.be.true;
        expect(wrapper.find("#tool-modeler3D-modelling-interaction").exists()).to.be.true;

        it("renders the template for the polygon attributes", () => {
            expect(wrapper.find("#tool-modeler3D-extrudedHeight").exists()).to.be.true;
            expect(wrapper.find("#tool-modeler3D-fill-color").exists()).to.be.true;
            expect(wrapper.find("#tool-modeler3D-outline-color").exists()).to.be.true;
        });
        it("renders the template for the polyline attributes", () => {
            store.commit("Tools/Modeler3D/setSelectedGeometry", "polygon");

            expect(wrapper.find("#tool-modeler3D-lineWidth").exists()).to.be.true;
            expect(wrapper.find("#tool-modeler3D-extrudedHeight").exists()).to.be.false;
            expect(wrapper.find("#tool-modeler3D-fill-color").exists()).to.be.true;
            expect(wrapper.find("#tool-modeler3D-outline-color").exists()).to.be.false;
        });
    });
    describe("Modeler3DDraw.vue methods", () => {
        it("should update currentPosition in Clamp-to-Ground mode", () => {
            const mouseMoveEvent = {
                endPosition: {x: 0, y: 0}
            };

            wrapper.vm.clampToGround = true;
            wrapper.vm.onMouseMove(mouseMoveEvent);

            expect(scene.camera.getPickRay.calledOnceWith(mouseMoveEvent.endPosition)).to.be.true;
            expect(scene.globe.pick.calledOnceWith(pickRayResult, scene)).to.be.true;
            expect(document.body.style.cursor).to.equal("copy");
            expect(wrapper.vm.currentPosition).to.eql({});
            expect(wrapper.vm.activeShapePoints[0]).to.eql({});
        });
        it("should update currentPosition with coordinate transformation in normal mode", () => {
            const mouseMoveEvent = {
                endPosition: {x: 0, y: 0}
            };

            wrapper.vm.clampToGround = false;
            wrapper.vm.onMouseMove(mouseMoveEvent);

            expect(document.body.style.cursor).to.equal("copy");
            expect(wrapper.vm.currentPosition).to.eql(Cartesian3Coordinates);
            expect(wrapper.vm.activeShapePoints[0]).to.eql(Cartesian3Coordinates);
        });

        it("should add new geometry position and call drawShape when activeShapePoints length is 1", () => {
            const mockShape = {
                id: 1,
                name: "Mock Shape",
                wasDrawn: true,
                clampToGround: true,
                polygon: {
                    height: 10,
                    extrudedHeight: 0
                }
            };

            store.commit("Tools/Modeler3D/setSelectedDrawType", "polygon");
            wrapper.vm.clampToGround = true;
            entities.values.push(mockShape);
            store.commit("Tools/Modeler3D/setActiveShapePoints", [{x: 100, y: 200, z: 300}]);
            global.Cesium.ShadowMode = {
                ENABLED: 1
            };

            wrapper.vm.addGeometryPosition();

            expect(scene.globe.getHeight.called).to.be.true;
            expect(scene.sampleHeight.called).to.be.false;
            expect(scene.globe.pick.called).to.be.false;
            expect(wrapper.vm.activeShapePoints).to.have.lengthOf(2);
        });

        it("should export the GeoJson", () => {
            entities.values = [
                {
                    id: "FloatingPointId",
                    positionIndex: 0,
                    polyline: {
                        material: {
                            color: {
                                getValue: () => {
                                    return "WHITE";
                                }
                            }
                        },
                        positions: {
                            getValue: () => {
                                return [4, 3, 3];
                            }
                        },
                        width: {
                            getValue: () => 2
                        }
                    }
                }
            ];
            wrapper.vm.exportToGeoJson();
            wrapper.vm.downloadGeoJson = sinon.spy();

            expect(wrapper.vm.downloadGeoJson.calledWith(sinon.match(JSON.stringify(sinon.match({
                type: "FeatureCollection",
                features: sinon.match.array
            })))));
        });

        it("should draw shapes when selectedGeometry is 'line' and activeShapePoints has at least 2 points", () => {
            store.commit("Tools/Modeler3D/setSelectedDrawType", "line");
            store.commit("Tools/Modeler3D/setActiveShapePoints", [{x: 100, y: 200, z: 300}, {x: 200, y: 300, z: 400}, {x: 300, y: 400, z: 500}]);
            wrapper.vm.drawShape();

            expect(entities.add.calledWith(sinon.match({id: sinon.match.number, polyline: sinon.match.object}))).to.be.true;
        });

        it("should draw shapes when selectedGeometry is 'polygon' and activeShapePoints has at least 3 points", () => {
            store.commit("Tools/Modeler3D/setSelectedDrawType", "polygon");

            store.commit("Tools/Modeler3D/setActiveShapePoints", [
                {x: 100, y: 200, z: 300},
                {x: 200, y: 300, z: 400},
                {x: 300, y: 400, z: 500},
                {x: 400, y: 500, z: 600}
            ]);
            wrapper.vm.drawShape();
            expect(entities.add.calledWith(sinon.match({id: sinon.match.number, polygon: sinon.match.object}))).to.be.true;
        });
    });
});
