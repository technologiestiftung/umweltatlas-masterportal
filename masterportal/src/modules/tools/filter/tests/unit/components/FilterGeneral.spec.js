import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import FilterGeneral from "../../../components/FilterGeneral.vue";
import FilterStore from "../../../store/indexFilter";
import sinon from "sinon";
import openlayerFunctions from "../../../utils/openlayerFunctions";

const localVue = createLocalVue();

localVue.use(Vuex);

config.mocks.$t = key => key;


describe("src/modules/tools/filter/components/FilterGeneral.vue", () => {
    let wrapper;

    const layers = [
            {
                title: "layerOne",
                layerId: "1234"
            },
            {
                title: "layerTwo",
                layerId: "4321"
            },
            {
                title: "layerThree",
                layerId: "5678"
            }
        ],
        groups = [{layers, title: "groupOne"}, {layers, title: "groupTwo"}],
        store = new Vuex.Store({
            namespaced: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        Filter: FilterStore
                    }
                }
            }
        });

    beforeEach(() => {
        wrapper = shallowMount(FilterGeneral, {
            localVue,
            store
        });
    });

    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
    });
    // selectedLayerGroups
    it("should exist", async () => {
        wrapper.vm.setActive(true);
        await wrapper.vm.$nextTick();

        expect(wrapper.find("#tool-general-filter").exists()).to.be.true;
    });

    it("should render two accordions if two layer groups are present and layerSelectorVisible is true", async () => {
        wrapper.vm.setActive(true);
        wrapper.vm.setLayerGroups(groups);
        await wrapper.vm.$nextTick();

        expect(wrapper.findAll(".accordion-collapse").exists()).to.be.true;
        expect(wrapper.findAll(".accordion-collapse")).to.have.lengthOf(2);
    });

    it("should render no accordions if layer groups are present and layerSelectorVisible is false", async () => {
        wrapper.vm.setActive(true);
        wrapper.vm.setLayerSelectorVisible(false);
        await wrapper.setData({
            layerConfigs: {
                groups,
                layers
            },
            preparedLayerGroups: groups
        });

        expect(wrapper.findAll(".accordion-collapse").exists()).to.be.false;
    });

    it("should render and open one accordion if its selected", async () => {
        wrapper.vm.setActive(true);
        wrapper.vm.setLayerGroups(groups);
        wrapper.vm.setLayerSelectorVisible(true);
        wrapper.vm.setSelectedGroups([0]);
        await wrapper.vm.$nextTick();

        expect(wrapper.findAll(".show").exists()).to.be.true;
        expect(wrapper.findAll(".show")).to.have.lengthOf(1);
    });
    describe("updateSelectedAccordions", () => {
        it("should add filterIds to selectedAccordion", async () => {
            await wrapper.setData({
                layerConfigs: {
                    multiLayerSelector: true
                }
            });

            const expected = [
                {
                    filterId: 0,
                    layerId: "1234"
                }
            ];

            wrapper.vm.updateSelectedAccordions(0);
            expect(wrapper.vm.selectedAccordions).to.deep.equal(expected);
        });
        it("should remove filterIds from selectedAccordion", async () => {
            await wrapper.setData({
                layerConfigs: {
                    multiLayerSelector: true
                }
            });
            wrapper.vm.updateSelectedAccordions(0);
            expect(wrapper.vm.selectedAccordions).to.deep.equal([]);
        });
        it("should add filterIds to selectedAccordion if multiLayerSelector is false", async () => {
            await wrapper.setData({
                layerConfigs: {
                    multiLayerSelector: false
                }
            });

            const expected = [
                {
                    filterId: 0,
                    layerId: "1234"
                }
            ];

            wrapper.vm.updateSelectedAccordions(0);
            expect(wrapper.vm.selectedAccordions).to.deep.equal(expected);
        });
        it("should remove filterIds from selectedAccordion if multiLayerSelector is false", async () => {
            await wrapper.setData({
                layerConfigs: {
                    multiLayerSelector: false
                }
            });
            wrapper.vm.updateSelectedAccordions(0);
            expect(wrapper.vm.selectedAccordions).to.deep.equal([]);
        });
        it("should not change the rule when adding and removing the filterId of selectedAccordion", async () => {
            await wrapper.setData({
                layerConfigs: {
                    multiLayerSelector: true
                }
            });
            const rule = [
                {
                    snippetId: 0,
                    startup: false,
                    fixed: false,
                    attrName: "test",
                    operator: "EQ",
                    value: ["Altona"]
                }
            ];

            wrapper.vm.setRulesOfFilters({
                rulesOfFilters: rule
            });
            wrapper.vm.updateSelectedAccordions(0);
            expect(wrapper.vm.rulesOfFilters).to.deep.equal(rule);
            wrapper.vm.updateSelectedAccordions(0);
            expect(wrapper.vm.rulesOfFilters).to.deep.equal(rule);
        });
    });
    describe("updateSelectedGroups", () => {
        it("should remove given index from selectedGroups if found in array", async () => {
            wrapper.vm.setSelectedGroups([0, 1]);
            await wrapper.vm.$nextTick();
            wrapper.vm.updateSelectedGroups(0);
            await wrapper.vm.$nextTick();

            expect(wrapper.vm.selectedGroups).to.deep.equal([1]);
        });
        it("should add given index to selectedGroups if not found in array", async () => {
            wrapper.vm.setSelectedGroups([0]);
            await wrapper.vm.$nextTick();
            wrapper.vm.updateSelectedGroups(1);
            await wrapper.vm.$nextTick();

            expect(wrapper.vm.selectedGroups).to.deep.equal([0, 1]);
        });
    });
    describe("handleStateForAlreadyActiveLayers", () => {
        it("should not do anything if if first param is not an object", () => {
            let param = null;

            param = undefined;
            wrapper.vm.handleStateForAlreadyActiveLayers(param);
            expect(param).to.be.undefined;
            param = null;
            wrapper.vm.handleStateForAlreadyActiveLayers(param);
            expect(param).to.be.null;
            param = "foo";
            wrapper.vm.handleStateForAlreadyActiveLayers(param);
            expect(param).to.be.equal("foo");
            param = 1234;
            wrapper.vm.handleStateForAlreadyActiveLayers(param);
            expect(param).to.be.equal(1234);
            param = [];
            wrapper.vm.handleStateForAlreadyActiveLayers(param);
            expect(param).to.be.an("array").and.to.be.empty;
            param = undefined;
            wrapper.vm.handleStateForAlreadyActiveLayers(param);
            expect(param).to.be.undefined;
        });
        it("should not do anything if given param has no rulesOfFilters or selectedAccordions property", () => {
            const param = {foo: "bar"};

            wrapper.vm.handleStateForAlreadyActiveLayers(param);
            expect(param).to.deep.equal({foo: "bar"});
        });
        it("should not remove rules of the given param if the matching layer is not activated", () => {
            const param = {
                rulesOfFilters: ["foo", "bar", "buz"],
                selectedAccordions: [
                    {
                        layerId: 0,
                        filterId: 0
                    },
                    {
                        layerId: 1,
                        filterId: 1
                    }
                ]
            };

            openlayerFunctions.getLayerByLayerId = (layerId) => {
                if (layerId === 1) {
                    return null;
                }
                return {
                    get: (toAsk) => {
                        if (toAsk === "typ") {
                            return "foo";
                        }
                        if (toAsk === "isSelected") {
                            return false;
                        }
                        return false;
                    },
                    layer: {
                        getSource: () => {
                            return {
                                getFeatures: () => [],
                                once: () => sinon.stub()
                            };
                        }
                    }
                };
            };

            wrapper.vm.handleStateForAlreadyActiveLayers(param);
            expect(param).to.deep.equal({rulesOfFilters: ["foo", "bar", "buz"], selectedAccordions: [{layerId: 0, filterId: 0}, {layerId: 1, filterId: 1}]});
        });
        it("should remove rules of the given param if the matching layer is already activated", () => {
            const param = {
                rulesOfFilters: ["foo", "bar", "buz"],
                selectedAccordions: [
                    {
                        layerId: 0,
                        filterId: 0
                    },
                    {
                        layerId: 1,
                        filterId: 1
                    }
                ]
            };

            openlayerFunctions.getLayerByLayerId = (layerId) => {
                if (layerId === 1) {
                    return null;
                }
                return {
                    get: (toAsk) => {
                        if (toAsk === "typ") {
                            return "foo";
                        }
                        if (toAsk === "isSelected") {
                            return true;
                        }
                        return false;
                    },
                    layer: {
                        getSource: () => {
                            return {
                                getFeatures: () => [],
                                once: () => sinon.stub()
                            };
                        }
                    }
                };
            };

            wrapper.vm.handleStateForAlreadyActiveLayers(param);
            expect(param).to.deep.equal({rulesOfFilters: [null, "bar", "buz"], selectedAccordions: [{layerId: 1, filterId: 1}]});
        });
    });
    describe("addToMapMoveListeners", () => {
        it("should not add to listeners list", () => {
            wrapper.vm.addToMapMoveListeners();
            expect(wrapper.vm.mapMoveListeners).to.deep.equal({});
            wrapper.vm.addToMapMoveListeners({});
            expect(wrapper.vm.mapMoveListeners).to.deep.equal({});
            wrapper.vm.addToMapMoveListeners({filterId: 0});
            expect(wrapper.vm.mapMoveListeners).to.deep.equal({});
        });
        it("should add to listeners list", () => {
            wrapper.vm.addToMapMoveListeners({filterId: 0, listener: false});
            expect(wrapper.vm.mapMoveListeners).to.deep.equal({0: false});
        });
    });
    describe("executeListeners", () => {
        it("should call a listener if its a function", () => {
            let foo = false;

            wrapper.vm.mapMoveListeners = {0: () => {
                foo = true;
            }};
            wrapper.vm.executeListeners();
            expect(foo).to.be.true;
        });
    });
});
