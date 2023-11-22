import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import LegendWindowComponent from "../../../components/LegendWindow.vue";
import Legend from "../../../store/indexLegend";
import {expect} from "chai";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("LegendWindow.vue", () => {
    const mockConfigJson = {
            Portalconfig: {
                menu: {
                    legend: {
                        name: "common:modules.legend.name",
                        icon: "bi-lightbulb",
                        showCollapseAllButton: true
                    }
                }
            }
        },
        getters = {
            mobile: state => state.mobile,
            uiStyle: state => state.uiStyle
        },
        mutations = {
            setMobile (state, mobile) {
                state.mobile = mobile;
            },
            setUiStyle (state, uiStyle) {
                state.uiStyle = uiStyle;
            }
        };
    let store,
        wrapper;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Legend
            },
            state: {
                configJson: mockConfigJson,
                mobile: false
            },
            getters,
            mutations
        });
        store.dispatch("Legend/setShowLegend", true);
        store.state.Legend.legends = [];
    });

    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
    });
    LegendWindowComponent.updated = undefined;

    describe("LegendWindow.vue rendering", () => {
        describe("render in desktop and mobile", () => {
            it("renders the legend window in desktop view", () => {
                wrapper = shallowMount(LegendWindowComponent, {store, localVue});

                expect(wrapper.find(".legend-window").exists()).to.be.true;
                expect(wrapper.find(".legend-title").exists()).to.be.true;
            });
            it("renders the legend window in mobile view", () => {
                store.commit("setMobile", true);
                wrapper = shallowMount(LegendWindowComponent, {store, localVue});
                expect(wrapper.find(".legend-window-mobile").exists()).to.be.true;
                expect(wrapper.find(".legend-title").exists()).to.be.true;
            });
            it("renders the legend window in table view", () => {
                store.commit("setUiStyle", "TABLE");
                wrapper = shallowMount(LegendWindowComponent, {store, localVue});
                expect(wrapper.find(".legend-window-table").exists()).to.be.true;
                expect(wrapper.find(".legend-title-table").exists()).to.be.true;
            });
        });
        describe("showCollapseAllButton", () => {
            it("renders the legend window with the collapseAllButton based on the config", () => {
                wrapper = shallowMount(LegendWindowComponent, {store, localVue});
                expect(wrapper.find("span.bootstrap-icon > .bi-arrow-up").exists()).to.be.true;
            });
            it("renders the legend window without the collapseAllButton based on the config", () => {
                store.state.Legend.showCollapseAllButton = false;
                wrapper = shallowMount(LegendWindowComponent, {store, localVue});
                expect(wrapper.find("span.bootstrap-icon > .bi-arrow-up").exists()).to.be.false;
            });
        });
    });
    describe("LegendMenu.vue methods", () => {
        describe("isValidLegendObj", () => {
            it("returns false if position is negative", () => {
                const legendObj = {
                    id: "1",
                    name: "layer_1",
                    legend: "foo.bar",
                    position: -1
                };

                wrapper = shallowMount(LegendWindowComponent, {store, localVue});
                expect(wrapper.vm.isValidLegendObj(legendObj)).to.be.equals(false);
            });
            it("returns false if legend is false", () => {
                const legendObj = {
                    id: "1",
                    name: "layer_1",
                    legend: false,
                    position: 1
                };

                wrapper = shallowMount(LegendWindowComponent, {store, localVue});
                expect(wrapper.vm.isValidLegendObj(legendObj)).to.be.equals(false);
            });
            it("returns false if legend is true", () => {
                const legendObj = {
                    id: "1",
                    name: "layer_1",
                    legend: true,
                    position: 1
                };

                wrapper = shallowMount(LegendWindowComponent, {store, localVue});
                expect(wrapper.vm.isValidLegendObj(legendObj)).to.be.equals(false);
            });
            it("returns false if legend is undefined", () => {
                const legendObj = {
                    id: "1",
                    name: "layer_1",
                    position: 1
                };

                wrapper = shallowMount(LegendWindowComponent, {store, localVue});
                expect(wrapper.vm.isValidLegendObj(legendObj)).to.be.equals(false);
            });
            it("returns false if legend is empty array", () => {
                const legendObj = {
                    id: "1",
                    name: "layer_1",
                    legend: [],
                    position: 1
                };

                wrapper = shallowMount(LegendWindowComponent, {store, localVue});
                expect(wrapper.vm.isValidLegendObj(legendObj)).to.be.equals(false);
            });
            it("returns true if position is positive and legend is string or not empty array", () => {
                const legendObj = {
                    id: "1",
                    name: "layer_1",
                    legend: ["link_to_legend"],
                    position: 1
                };

                wrapper = shallowMount(LegendWindowComponent, {store, localVue});
                expect(wrapper.vm.isValidLegendObj(legendObj)).to.be.equals(true);
            });
        });
        describe("generateId", () => {
            it("generates id", () => {
                wrapper = shallowMount(LegendWindowComponent, {store, localVue});
                expect(wrapper.vm.generateId("Layername 1")).to.be.equals("legend_Layername_1");
                expect(wrapper.vm.generateId("Layername 1:")).to.be.equals("legend_Layername_1_");
                expect(wrapper.vm.generateId("Layername (1)")).to.be.equals("legend_Layername_1_");
                expect(wrapper.vm.generateId("Layername (/)")).to.be.equals("legend_Layername_");
                expect(wrapper.vm.generateId("Layername (//)")).to.be.equals("legend_Layername_");
                expect(wrapper.vm.generateId("Layername (/abc/)")).to.be.equals("legend_Layername_abc_");
            });
        });
        describe("LegendMenu.vue isLayerNotYetInLegend", () => {
            it("returns true if layer is not yet in legend", () => {
                wrapper = shallowMount(LegendWindowComponent, {store, localVue});
                expect(wrapper.vm.isLayerNotYetInLegend("Layername_1")).to.be.equals(true);
            });
            it("returns false if layer is already in legend", () => {
                const legendObj = {
                    id: "1",
                    name: "layer_1",
                    legend: ["link_to_legend"],
                    position: 1
                };

                wrapper = shallowMount(LegendWindowComponent, {store, localVue});
                wrapper.vm.addLegend(legendObj);
                expect(wrapper.vm.isLayerNotYetInLegend(legendObj.id)).to.be.equals(false);
            });
        });
        describe("LegendMenu.vue isLegendChanged", () => {
            it("returns true if legend changed", () => {
                const legendObj = {
                    id: "1",
                    name: "layer_1",
                    legend: ["link_to_legend"],
                    position: 1
                };

                wrapper = shallowMount(LegendWindowComponent, {store, localVue});
                wrapper.vm.addLegend(legendObj);
                expect(wrapper.vm.isLegendChanged(legendObj.id, {
                    id: "1",
                    name: "layer_1",
                    legend: ["link_to_legend"],
                    position: 0
                })).to.be.equals(true);
                expect(wrapper.vm.isLegendChanged(legendObj.id, {
                    id: "1",
                    name: "layer_1",
                    legend: ["changed_link_to_legend"],
                    position: 1
                })).to.be.equals(true);
                expect(wrapper.vm.isLegendChanged(legendObj.id, {
                    id: "1",
                    name: "layer_1",
                    legend: ["link_to_legend", "new_link"],
                    position: 1
                })).to.be.equals(true);
                expect(wrapper.vm.isLegendChanged(legendObj.id, {
                    id: "1",
                    name: "changed_layer_1",
                    legend: ["link_to_legend"],
                    position: 1
                })).to.be.equals(true);
                expect(wrapper.vm.isLegendChanged(legendObj.id, {
                    id: "changed_1",
                    name: "layer_1",
                    legend: ["link_to_legend"],
                    position: 1
                })).to.be.equals(true);
                expect(wrapper.vm.isLegendChanged(legendObj.id, {
                    id: "2042",
                    name: "Festgestellte Änderungen – Berichtigungen – Nachrichtliche Übernahmen seit 1997",
                    legend: ["https://geodienste.hamburg.de/HH_WMS_FNP_Aend?VERSION=1.3.0&SERVICE=WMS&REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=fnp_aenderungsuebersicht_aenderungen_festgestellt"],
                    position: 2
                })).to.be.equals(true);
            });
            it("returns false if legend doesn't changed", () => {
                const legendObj = {
                    id: "1",
                    name: "layer_1",
                    legend: ["link_to_legend"],
                    position: 1
                };

                wrapper = shallowMount(LegendWindowComponent, {store, localVue});
                wrapper.vm.addLegend(legendObj);
                expect(wrapper.vm.isLegendChanged(legendObj.id, legendObj)).to.be.equals(false);
            });
        });
        describe("prepareLegendForGroupLayer", () => {
            it("iterates over all layerSources and aggregates the legends", () => {
                const layerSource = [
                    new Backbone.Model({legend: ["foobar", "barfoo"]}),
                    new Backbone.Model({legend: ["barbar"]}),
                    new Backbone.Model({legend: ["foofoo"]})
                ];

                wrapper = shallowMount(LegendWindowComponent, {store, localVue});
                expect(wrapper.vm.prepareLegendForGroupLayer(layerSource)).to.deep.equal(["foobar", "barfoo", "barbar", "foofoo"]);
            });
        });
        describe("prepareLegendForPoint", () => {
            it("prepareLegendForPoint - imageName contains whole path", () => {
                const legendObj = {},
                    style = {
                        imagePath: "foo/bar/",
                        type: "icon",
                        imageName: "https://localhost:9001/portal/basic/geodaten/icons/svg/poi/Rathaus.svg"
                    };
                let result = null;

                wrapper = shallowMount(LegendWindowComponent, {store, localVue});
                result = wrapper.vm.prepareLegendForPoint(legendObj, style);

                expect(result.graphic).to.deep.equal(style.imageName);
            });
            it("prepareLegendForPoint - imageName and imagePath contain whole path", () => {
                const legendObj = {},
                    style = {
                        imagePath: "https://localhost:9001/portal/basic/geodaten2/icons",
                        type: "icon",
                        imageName: "https://localhost:9001/portal/basic/geodaten/icons/svg/poi/Rathaus.svg"
                    };
                let result = null;

                wrapper = shallowMount(LegendWindowComponent, {store, localVue});
                result = wrapper.vm.prepareLegendForPoint(legendObj, style);

                expect(result.graphic).to.deep.equal(style.imageName);
            });
            it("prepareLegendForPoint - imageName contains complete svg", () => {
                const legendObj = {},
                    style = {
                        imagePath: "foo/bar/",
                        type: "icon",
                        imageName: "<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='#E10019' class='bi bi-geo-fill' viewBox='0 0 16 16'><path fill-rule='evenodd' d='M4 4a4 4 0 1 1 4.5 3.969V13.5a.5.5 0 0 1-1 0V7.97A4 4 0 0 1 4 3.999zm2.493 8.574a.5.5 0 0 1-.411.575c-.712.118-1.28.295-1.655.493a1.319 1.319 0 0 0-.37.265.301.301 0 0 0-.057.09V14l.002.008a.147.147 0 0 0 .016.033.617.617 0 0 0 .145.15c.165.13.435.27.813.395.751.25 1.82.414 3.024.414s2.273-.163 3.024-.414c.378-.126.648-.265.813-.395a.619.619 0 0 0 .146-.15.148.148 0 0 0 .015-.033L12 14v-.004a.301.301 0 0 0-.057-.09 1.318 1.318 0 0 0-.37-.264c-.376-.198-.943-.375-1.655-.493a.5.5 0 1 1 .164-.986c.77.127 1.452.328 1.957.594C12.5 13 13 13.4 13 14c0 .426-.26.752-.544.977-.29.228-.68.413-1.116.558-.878.293-2.059.465-3.34.465-1.281 0-2.462-.172-3.34-.465-.436-.145-.826-.33-1.116-.558C3.26 14.752 3 14.426 3 14c0-.599.5-1 .961-1.243.505-.266 1.187-.467 1.957-.594a.5.5 0 0 1 .575.411z'/></svg>"
                    };
                let result = null;

                wrapper = shallowMount(LegendWindowComponent, {store, localVue});
                result = wrapper.vm.prepareLegendForPoint(legendObj, style);

                expect(result.graphic).to.deep.equal("data:image/svg+xml;charset=utf-8," + encodeURIComponent(style.imageName));
            });
            it("prepareLegendForPoint - imageName contains path", () => {
                const legendObj = {},
                    style = {
                        imagePath: "foo/bar/",
                        type: "icon",
                        imageName: "/svg/poi/Rathaus.svg"
                    };
                let result = null;

                wrapper = shallowMount(LegendWindowComponent, {store, localVue});
                result = wrapper.vm.prepareLegendForPoint(legendObj, style);

                expect(result.graphic).to.deep.equal(style.imagePath + style.imageName);
            });
            it("prepareLegendForPoint - imageName contains icon name", () => {
                const legendObj = {},
                    style = {
                        imagePath: "./foo/bar/",
                        type: "icon",
                        imageName: "Rathaus.svg"
                    };
                let result = null;

                wrapper = shallowMount(LegendWindowComponent, {store, localVue});
                result = wrapper.vm.prepareLegendForPoint(legendObj, style);

                expect(result.graphic).to.deep.equal(style.imagePath + style.imageName);
            });
        });
    });
});
