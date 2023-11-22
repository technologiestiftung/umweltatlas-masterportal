import Vuex from "vuex";
import {expect} from "chai";
import sinon from "sinon";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import crs from "@masterportal/masterportalapi/src/crs";
import Modeler3DComponent from "../../../components/Modeler3D.vue";
import Modeler3D from "../../../store/indexModeler3D";
import Modeler3DDraw from "../../../components/Modeler3DDraw.vue";
import Modeler3DImport from "../../../components/Modeler3DImport.vue";
import Modeler3DEntityModel from "../../../components/Modeler3DEntityModel.vue";
import getGfiFeaturesByTileFeatureModule from "../../../../../../api/gfi/getGfiFeaturesByTileFeature";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/tools/modeler3D/components/Modeler3D.vue", () => {
    const mockMapGetters = {
            mouseCoordinate: () => {
                return [11.549606597773037, 48.17285700012215];
            }
        },
        mockConfigJson = {
            Portalconfig: {
                menu: {
                    tools: {
                        children: {
                            modeler3D: {
                                "name": "translate#common:menu.modeler3D",
                                "icon": "bi-bounding-box"
                            }
                        }
                    }
                }
            }
        },
        namedProjections = [
            ["EPSG:31467", "+title=Bessel/Gauß-Krüger 3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs"],
            ["EPSG:25832", "+title=ETRS89/UTM 32N +proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"],
            ["EPSG:8395", "+title=ETRS89_3GK3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=GRS80 +datum=GRS80 +units=m +no_defs"],
            ["EPSG:8395", "+title=EPSG: 8395 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +datum=GRS80 +units=m +no_defs"],
            ["EPSG:4326", "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"]
        ],
        entityList = [
            {
                id: "entityId",
                position: {getValue: () => "position1"},
                rotation: 0,
                model: {
                    color: null,
                    silhouetteColor: null,
                    silhouetteSize: 0,
                    colorBlendAmount: 0
                }
            },
            {
                id: 2,
                position: {getValue: () => "position2"},
                rotation: 0,
                model: {
                    color: null,
                    silhouetteColor: "white",
                    silhouetteSize: 10,
                    colorBlendAmount: 2
                },
                cylinder: {length: 4}
            }
        ],
        entities = {
            getById: (val) => {
                return entityList.find(x => x.id === val);
            },
            values: [{id: "FloatingPointId", positionIndex: 0, polygon: {length: 4}}]
        },
        pickRayResult = {
            origin: {},
            direction: {}
        },
        scene = {
            requestRender: sinon.stub(),
            camera: {
                getPickRay: sinon.stub().returns(pickRayResult)
            },
            globe: {
                pick: sinon.stub().returns([11.549606597773037, 48.17285700012215]),
                getHeight: sinon.stub().returns(5)
            },
            sampleHeight: sinon.stub()
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
        },
        event = {position: "winCoords"};

    let store,
        wrapper,
        origUpdateUI,
        origMovePolygon,
        origMovePolyline,
        origUpdatePositionUI;

    beforeEach(() => {
        mapCollection.clear();
        mapCollection.addMap(map3D, "3D");

        global.Cesium = {
            ColorBlendMode: {
                HIGHLIGHT: 0
            },
            Color: {
                fromCssColorString: () => {
                    return "white";
                },
                fromAlpha: () => {
                    return "RED";
                }
            },
            CallbackProperty: sinon.stub(),
            Entity: function (id) {
                this.id = id;
            },
            Cesium3DTileFeature: function (options) {
                this.tileset = options.tileset;
            },
            defaultValue: () => {
                return new global.Cesium.Entity("entityId");
            },
            Cartesian3: {
                equals: () => false
            },
            Cartographic: {
                fromDegrees: () => ({
                    longitude: 0.17443853256965697,
                    latitude: 0.9346599366554966,
                    height: 6.134088691520464
                }),
                fromCartesian: () => ({
                    longitude: 0.17443853256965697,
                    latitude: 0.9346599366554966,
                    height: 6.134088691520464
                }),
                toCartesian: () => ({
                    x: 3739310.9273738265,
                    y: 659341.4057539968,
                    z: 5107613.232959453
                })
            }
        };

        origUpdateUI = Modeler3D.actions.updateUI;
        Modeler3D.actions.updateUI = sinon.spy();
        origMovePolygon = Modeler3D.actions.movePolygon;
        Modeler3D.actions.movePolygon = sinon.spy();
        origMovePolyline = Modeler3D.actions.movePolyline;
        Modeler3D.actions.movePolyline = sinon.spy();
        origUpdatePositionUI = Modeler3D.actions.updatePositionUI;
        Modeler3D.actions.updatePositionUI = sinon.spy();

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
            },
            getters: {
                namedProjections: () => namedProjections
            },
            state: {
                configJson: mockConfigJson
            }

        });
        crs.registerProjections(namedProjections);

        store.commit("Tools/Modeler3D/setActive", true);
        store.commit("Tools/Modeler3D/setCurrentView", "import");
        store.commit("Tools/Modeler3D/setHiddenObjects", []);
        store.commit("Tools/Modeler3D/setImportedModels", [{id: 1, name: "modelName", heading: 120, scale: 1}]);
    });

    afterEach(() => {
        Modeler3D.actions.updateUI = origUpdateUI;
        Modeler3D.actions.movePolygon = origMovePolygon;
        Modeler3D.actions.movePolyline = origMovePolyline;
        Modeler3D.actions.updatePositionUI = origUpdatePositionUI;

        sinon.restore();
        if (wrapper) {
            wrapper.destroy();
        }
    });

    it("renders Modeler3D with import view", async () => {
        wrapper = shallowMount(Modeler3DComponent, {store, localVue});

        store.commit("Tools/Modeler3D/setCurrentView", "import");
        await wrapper.vm.$nextTick();

        expect(wrapper.find("#tool-modeler3D").exists()).to.be.true;
        expect(wrapper.findComponent(Modeler3DImport).exists()).to.be.true;
        expect(wrapper.findComponent(Modeler3DDraw).exists()).to.be.false;
        expect(wrapper.find("#modeler3D-options-view").exists()).to.be.false;
    });

    it("does not render Modeler3D", () => {
        store.commit("Tools/Modeler3D/setActive", false);
        wrapper = shallowMount(Modeler3DComponent, {store, localVue});

        expect(wrapper.find("#tool-modeler3D").exists()).to.be.false;
    });

    it("renders Modeler3D with draw view", async () => {
        wrapper = shallowMount(Modeler3DComponent, {store, localVue});

        store.commit("Tools/Modeler3D/setCurrentView", "draw");
        await wrapper.vm.$nextTick();

        expect(wrapper.find("#tool-modeler3D").exists()).to.be.true;
        expect(wrapper.findComponent(Modeler3DDraw).exists()).to.be.true;
        expect(wrapper.findComponent(Modeler3DImport).exists()).to.be.false;
        expect(wrapper.find("#modeler3D-options-view").exists()).to.be.false;
    });

    it("renders Modeler3D with options view", async () => {
        wrapper = shallowMount(Modeler3DComponent, {store, localVue});

        store.commit("Tools/Modeler3D/setCurrentView", "");
        await wrapper.vm.$nextTick();

        expect(wrapper.find("#tool-modeler3D").exists()).to.be.true;
        expect(wrapper.find("#modeler3D-options-view").exists()).to.be.true;
        expect(wrapper.findComponent(Modeler3DDraw).exists()).to.be.false;
        expect(wrapper.findComponent(Modeler3DImport).exists()).to.be.false;
    });

    it("renders Modeler3D with entity model view", async () => {
        wrapper = shallowMount(Modeler3DComponent, {store, localVue});

        store.commit("Tools/Modeler3D/setCurrentModelId", "someId");
        await wrapper.vm.$nextTick();

        expect(wrapper.find("#tool-modeler3D").exists()).to.be.true;
        expect(wrapper.findComponent(Modeler3DEntityModel).exists()).to.be.true;
        expect(wrapper.findComponent(Modeler3DDraw).exists()).to.be.false;
        expect(wrapper.findComponent(Modeler3DImport).exists()).to.be.false;
        expect(wrapper.find("#modeler3D-options-view").exists()).to.be.false;
    });

    it("renders hiddenObject List when set", async () => {
        store.commit("Tools/Modeler3D/setCurrentModelId", null);
        store.commit("Tools/Modeler3D/setHiddenObjects", [
            {
                id: "id",
                pickId: "pickId",
                layerId: "layerId",
                name: "name"
            }
        ]);

        wrapper = shallowMount(Modeler3DComponent, {store, localVue});
        await wrapper.vm.$nextTick();

        expect(wrapper.find("#tool-modeler3D").exists()).to.be.true;
        expect(wrapper.find("#hidden-objects").exists()).to.be.true;
    });

    describe("Modeler3D.vue watcher", () => {
        it("watch to currentModelId shall highlight selected Entity and populate UI", async () => {
            wrapper = shallowMount(Modeler3DComponent, {store, localVue});

            wrapper.vm.highlightEntity = sinon.spy();
            store.commit("Tools/Modeler3D/setCurrentModelId", "entityId");
            await wrapper.vm.$nextTick();

            expect(wrapper.vm.highlightEntity.calledWith(entityList[0]));
            expect(store.state.Tools.Modeler3D.currentModelPosition).to.eql("position1");
            expect(Modeler3D.actions.updateUI.called).to.be.true;
        });

        it("watch to currentModelId shall reset highlighting of deselected Entity", async () => {
            store.commit("Tools/Modeler3D/setCurrentModelId", 2);
            wrapper = shallowMount(Modeler3DComponent, {store, localVue});
            wrapper.vm.highlightEntity = sinon.spy();
            global.Cesium.Color = {
                WHITE: "#ffffff"
            };

            store.commit("Tools/Modeler3D/setCurrentModelId", null);
            await wrapper.vm.$nextTick();

            expect(entityList[1].model.color).to.be.equals("#ffffff");
            expect(entityList[1].model.silhouetteColor).to.be.null;
            expect(entityList[1].model.silhouetteSize).to.be.equals(0);
            expect(entityList[1].model.colorBlendAmount).to.be.equals(0);

            expect(scene.requestRender.called).to.be.true;
            expect(store.state.Tools.Modeler3D.currentModelPosition).to.be.null;
        });
    });

    describe("Modeler3D.vue methods", () => {
        it("initProjections adds WGS84 decimal projection", () => {
            let projections = [];

            wrapper = shallowMount(Modeler3DComponent, {store, localVue});
            wrapper.vm.initProjections();

            projections = store.state.Tools.Modeler3D.projections;
            expect(projections.length).to.be.equals(6);
            expect(projections[0].id).to.be.not.null;
            expect(projections.filter(proj => proj.id === "http://www.opengis.net/gml/srs/epsg.xml#4326-DG").length).to.be.equals(1);
        });

        it("initProjections adds ETRS89_3GK3", () => {
            let projections = [];

            wrapper = shallowMount(Modeler3DComponent, {store, localVue});
            wrapper.vm.initProjections();

            projections = store.state.Tools.Modeler3D.projections;
            expect(projections.length).to.be.equals(6);
            expect(projections[0].id).to.be.not.null;
            expect(projections.filter(proj => proj.id === "http://www.opengis.net/gml/srs/epsg.xml#ETRS893GK3").length).to.be.equals(1);
        });

        it("selectObject picks an entity", () => {
            let currentModelId = "";
            const pickObject = new global.Cesium.Entity("entityId");

            scene.pick = sinon.stub().returns(pickObject);
            global.Cesium.defined = sinon.stub().returns(true);
            global.Cesium.defaultValue = sinon.stub().returns(pickObject);

            wrapper = shallowMount(Modeler3DComponent, {store, localVue});
            wrapper.vm.selectObject(event);

            currentModelId = store.state.Tools.Modeler3D.currentModelId;

            expect(currentModelId).to.eql("entityId");
        });

        it("selectObject picks object and adds it to list", () => {
            let hiddenObjects = [];
            const pickObject = new global.Cesium.Cesium3DTileFeature({tileset: {}}),
                tileSetModel = {
                    hideObjects: sinon.stub()
                },
                radioStub = sinon.stub(Radio, "request").returns([tileSetModel]);

            scene.pick = sinon.stub().returns(pickObject);
            global.Cesium.defined = sinon.stub().returns(true);
            global.Cesium.defaultValue = sinon.stub().returns(false);
            sinon.stub(getGfiFeaturesByTileFeatureModule, "getGfiFeaturesByTileFeature").returns([{
                getProperties: () => ({
                    gmlid: "gmlId"
                })
            }]);

            wrapper = shallowMount(Modeler3DComponent, {store, localVue});
            wrapper.vm.selectObject(event);

            hiddenObjects = store.state.Tools.Modeler3D.hiddenObjects;

            expect(radioStub.called).to.be.true;
            expect(getGfiFeaturesByTileFeatureModule.getGfiFeaturesByTileFeature.calledWith(pickObject));
            expect(tileSetModel.hideObjects.calledWith(["gmlId"])).to.be.true;
            expect(hiddenObjects.length).to.be.equals(1);
            expect(hiddenObjects[0].name).to.be.equals("gmlId");
        });

        it("showObject shows the hidden object and deletes it from list", () => {
            let hiddenObjects = [];
            const object = {
                    name: "gmlId"
                },
                tileSetModel = {
                    showObjects: sinon.stub()
                },
                radioStub = sinon.stub(Radio, "request").returns([tileSetModel]);

            wrapper = shallowMount(Modeler3DComponent, {store, localVue});
            wrapper.vm.showObject(object);

            hiddenObjects = store.state.Tools.Modeler3D.hiddenObjects;

            expect(hiddenObjects.length).to.eql(0);
            expect(radioStub.called).to.be.true;
            expect(tileSetModel.showObjects.calledWith(["gmlId"])).to.be.true;
        });

        it("should set cursor to \"grab\" when Cesium.defined returns true", async () => {
            wrapper = shallowMount(Modeler3DComponent, {store, localVue});
            global.Cesium.defaultValue = () => {
                return new global.Cesium.Entity("entityId");
            };
            store.commit("Tools/Modeler3D/setCurrentModelId", "entityId");
            global.Cesium.defined = sinon.stub().returns(true);

            wrapper.vm.cursorCheck(event);
            expect(document.body.style.cursor).to.equal("grab");
        });

        it("should set cursor to \"grab\" when isDrawing is true", async () => {
            wrapper = shallowMount(Modeler3DComponent, {store, localVue});
            global.Cesium.defaultValue = () => {
                return new global.Cesium.Entity("otherId");
            };
            store.commit("Tools/Modeler3D/setCurrentModelId", "null");
            global.Cesium.defined = sinon.stub().returns(true);

            wrapper.vm.cursorCheck(event);
            expect(document.body.style.cursor).to.equal("pointer");
        });

        it("should set cursor to \"auto\" when Cesium.defined returns false", async () => {
            wrapper = shallowMount(Modeler3DComponent, {store, localVue});
            store.commit("Tools/Modeler3D/setCurrentModelId", "otherId");
            global.Cesium.defined = sinon.stub().returns(false);

            wrapper.vm.cursorCheck(event);
            expect(document.body.style.cursor).to.equal("auto");
        });

        it("should update the position when moving a cylinder with clampToGround set to true", async () => {
            wrapper = shallowMount(Modeler3DComponent, {store, localVue});
            entityList[0].clampToGround = true;
            store.commit("Tools/Modeler3D/setCurrentModelId", "entityId");
            await wrapper.vm.$nextTick();
            store.commit("Tools/Modeler3D/setCylinderId", 2);
            store.commit("Tools/Modeler3D/setIsDragging", true);
            global.Cesium.defined = sinon.stub().returns(true);

            wrapper.vm.moveCylinder(event);
            expect(wrapper.vm.currentPosition).to.eql([11.549606597773037, 48.17285700012215]);
        });

        it("should update the position when moving a cylinder with clampToGround set to false", async () => {
            wrapper = shallowMount(Modeler3DComponent, {store, localVue});
            entityList[0].clampToGround = false;
            store.commit("Tools/Modeler3D/setCurrentModelId", "entityId");
            await wrapper.vm.$nextTick();
            store.commit("Tools/Modeler3D/setCylinderId", 2);
            store.commit("Tools/Modeler3D/setIsDragging", true);
            global.Cesium.defined = sinon.stub().returns(true);

            wrapper.vm.moveCylinder(event);
            expect(wrapper.vm.currentPosition).to.eql({
                x: 3739310.9273738265,
                y: 659341.4057539968,
                z: 5107613.232959453
            });
        });

        it("should perform actions when dragging a polygon", async () => {
            wrapper = shallowMount(Modeler3DComponent, {store, localVue});
            entityList[0].clampToGround = true;
            entityList[0].polygon = true;
            entityList[0].polyline = false;
            store.commit("Tools/Modeler3D/setCurrentModelId", "entityId");
            await wrapper.vm.$nextTick();
            store.commit("Tools/Modeler3D/setCylinderId", 2);
            store.commit("Tools/Modeler3D/setIsDragging", true);
            global.Cesium.defined = sinon.stub().returns(true);

            wrapper.vm.onMouseMove(event);
            expect(Modeler3D.actions.movePolygon).to.be.called;
            expect(Modeler3D.actions.updatePositionUI).to.be.called;
        });
        it("should perform actions when dragging a polyline", async () => {
            wrapper = shallowMount(Modeler3DComponent, {store, localVue});
            entityList[0].polygon = false;
            entityList[0].polyline = true;
            store.commit("Tools/Modeler3D/setCurrentModelId", "entityId");
            await wrapper.vm.$nextTick();
            store.commit("Tools/Modeler3D/setCylinderId", 2);
            store.commit("Tools/Modeler3D/setIsDragging", true);
            global.Cesium.defined = sinon.stub().returns(true);

            wrapper.vm.onMouseMove(event);
            expect(Modeler3D.actions.movePolyline).to.be.called;
            expect(Modeler3D.actions.updatePositionUI).to.be.called;
        });
        it("should perform actions when dragging of a cylinder is finished", async () => {
            wrapper = shallowMount(Modeler3DComponent, {store, localVue});
            entityList[0].polygon = false;
            entityList[0].polyline = false;
            store.commit("Tools/Modeler3D/setCurrentModelId", "entityId");
            wrapper.vm.removeInputActions = sinon.spy();
            await wrapper.vm.$nextTick();
            store.commit("Tools/Modeler3D/setCylinderId", 2);
            store.commit("Tools/Modeler3D/setIsDragging", true);

            wrapper.vm.onMouseUp(event);
            expect(wrapper.vm.removeInputActions).to.be.called;
            expect(store.state.Tools.Modeler3D.isDragging).to.be.false;
            expect(store.state.Tools.Modeler3D.cylinderId).to.eql(null);
            expect(document.body.style.cursor).to.equal("auto");
        });
        it("should perform actions when dragging of a drawn object is finished", async () => {
            wrapper = shallowMount(Modeler3DComponent, {store, localVue});
            entityList[0].polygon = false;
            entityList[0].polyline = false;
            store.commit("Tools/Modeler3D/setCurrentModelId", "entityId");
            wrapper.vm.removeInputActions = sinon.spy();
            await wrapper.vm.$nextTick();
            store.commit("Tools/Modeler3D/setWasDrawn", true);
            store.commit("Tools/Modeler3D/setIsDragging", true);

            wrapper.vm.onMouseUp(event);
            expect(wrapper.vm.removeInputActions).to.be.called;
            expect(store.state.Tools.Modeler3D.isDragging).to.be.false;
            expect(document.body.style.cursor).to.equal("auto");
        });
        it("should highlight a drawn polygon", async () => {
            wrapper = shallowMount(Modeler3DComponent, {store, localVue});
            entityList[0].polygon = {outline: true, outlineColor: "white", material: {
                color: "RED"
            }};
            entityList[0].wasDrawn = true;
            store.commit("Tools/Modeler3D/setCurrentModelId", "entityId");
            await wrapper.vm.$nextTick();
            store.commit("Tools/Modeler3D/setWasDrawn", true);
            store.commit("Tools/Modeler3D/setIsDragging", true);

            wrapper.vm.highlightEntity(entityList[0]);
            expect(entityList[0].originalColor).to.eql(entityList[0].polygon.material.color);
            expect(entityList[0].originalOutlineColor).to.eql(entityList[0].polygon.outlineColor);
            expect(entityList[0].polygon.material.color).to.eql(
                global.Cesium.Color.fromAlpha(global.Cesium.Color.fromCssColorString("RED"), parseFloat(1.0))
            );
            expect(entityList[0].polygon.outline).to.be.true;
            expect(entityList[0].polygon.outlineColor).to.eql(global.Cesium.Color.fromCssColorString("white"));
        });
        it("should highlight a drawn polyline", async () => {
            wrapper = shallowMount(Modeler3DComponent, {store, localVue});
            entityList[0].polyline = {material: {
                color: "RED"
            }};
            entityList[0].wasDrawn = true;
            store.commit("Tools/Modeler3D/setCurrentModelId", "entityId");
            await wrapper.vm.$nextTick();
            store.commit("Tools/Modeler3D/setWasDrawn", true);
            store.commit("Tools/Modeler3D/setIsDragging", true);

            wrapper.vm.highlightEntity(entityList[0]);
            expect(entityList[0].originalColor).to.eql(entityList[0].polyline.material.color);
            expect(entityList[0].polyline.material.color).to.eql(
                global.Cesium.Color.fromAlpha(global.Cesium.Color.fromCssColorString("RED"), parseFloat(1.0))
            );
        });
        it("should handle the mouse move event for the pov cylinder", async () => {
            wrapper = shallowMount(Modeler3DComponent, {store, localVue});
            store.commit("Tools/Modeler3D/setCylinderId", 2);
            await wrapper.vm.$nextTick();

            wrapper.vm.moveHandler();
            expect(document.body.style.cursor).to.equal("copy");
            expect(wrapper.vm.currentCartesian).to.eql({
                x: 3739310.9273738265,
                y: 659341.4057539968,
                z: 5107613.232959453
            });
        });
    });
});
