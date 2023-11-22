import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import LayerFilterSnippet from "../../../components/LayerFilterSnippet.vue";
import SnippetCheckboxFilterInMapExtent from "../../../components/SnippetCheckboxFilterInMapExtent.vue";
import SnippetDownload from "../../../components/SnippetDownload.vue";
import {expect} from "chai";
import MapHandler from "../../../utils/mapHandler.js";
import sinon from "sinon";

const localVue = createLocalVue();

localVue.use(Vuex);

config.mocks.$t = key => key;

describe("src/modules/tools/filter/components/LayerFilterSnippet.vue", () => {
    let wrapper = null,
        mapHandler = null;

    beforeEach(() => {
        mapHandler = new MapHandler();
        mapHandler.getLayerModelByFilterId = sinon.stub().returns({
            get: (val) => {
                if (val === "isSelected") {
                    return false;
                }
                return "TEST";
            }
        });
        mapHandler.activateLayer = sinon.stub();

        wrapper = shallowMount(LayerFilterSnippet, {
            propsData: {
                layerConfig: {
                    service: {
                        type: "something external"
                    }
                },
                mapHandler
            },
            localVue
        });

    });
    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
        sinon.restore();
    });

    describe("onMounted", () => {
        it("should not trigger registerMapMoveListener event", () => {
            expect(wrapper.emitted()).to.not.have.property("registerMapMoveListener");
        });
        it("should trigger registerMapMoveListener event if filterOnMove is configured", () => {
            wrapper = shallowMount(LayerFilterSnippet, {
                propsData: {
                    layerConfig: {
                        service: {
                            type: "something external"
                        },
                        strategy: "active",
                        filterOnMove: true
                    },
                    mapHandler,
                    openMultipleAccordeons: false
                },
                localVue
            });

            expect(wrapper.emitted()).to.have.property("registerMapMoveListener");
        });
    });
    describe("hasThisSnippetTheExpectedType", () => {
        it("should return false if the given snippet has not the expected type", () => {
            expect(wrapper.vm.hasThisSnippetTheExpectedType(undefined)).to.be.false;
            expect(wrapper.vm.hasThisSnippetTheExpectedType(null)).to.be.false;
            expect(wrapper.vm.hasThisSnippetTheExpectedType(1234)).to.be.false;
            expect(wrapper.vm.hasThisSnippetTheExpectedType("string")).to.be.false;
            expect(wrapper.vm.hasThisSnippetTheExpectedType(true)).to.be.false;
            expect(wrapper.vm.hasThisSnippetTheExpectedType(false)).to.be.false;
            expect(wrapper.vm.hasThisSnippetTheExpectedType([])).to.be.false;
            expect(wrapper.vm.hasThisSnippetTheExpectedType({})).to.be.false;

            expect(wrapper.vm.hasThisSnippetTheExpectedType({type: "anything"}, "something")).to.be.false;
        });
        it("should return true if the given snippet has the expected type", () => {
            expect(wrapper.vm.hasThisSnippetTheExpectedType({type: "something"}, "something")).to.be.true;
        });
    });
    describe("setSearchInMapExtent", () => {
        it("should set the internal searchInMapExtent variable to the given value", () => {
            expect(wrapper.vm.searchInMapExtent).to.be.false;
            wrapper.vm.setSearchInMapExtent(true);
            expect(wrapper.vm.searchInMapExtent).to.be.true;
        });
    });
    describe("renderCheckboxSearchInMapExtent", () => {
        it("Should render the checkbox component correctly", async () => {
            wrapper = shallowMount(LayerFilterSnippet, {
                propsData: {
                    layerConfig: {
                        service: {
                            type: "something external"
                        },
                        searchInMapExtent: true
                    },
                    mapHandler
                },
                localVue
            });

            wrapper.setData({outOfZoom: false});
            await wrapper.vm.$nextTick();

            expect(wrapper.findComponent(SnippetCheckboxFilterInMapExtent).exists()).to.be.true;
        });
    });

    describe("changeRule", () => {
        it("should emit the updateRules event", async () => {
            wrapper.vm.changeRule({
                snippetId: 0,
                startup: false,
                fixed: false,
                attrName: "test",
                operator: "EQ"
            });
            await wrapper.vm.$nextTick();
            expect(wrapper.emitted().updateRules).to.be.an("array").with.lengthOf(1);
        });
        it("should call handleActiveStrategy if strategy is active", async () => {
            const spyHandleActiveStrategy = sinon.spy(wrapper.vm, "handleActiveStrategy");

            await wrapper.setProps({layerConfig: {strategy: "active"}});
            wrapper.vm.changeRule({
                snippetId: 0,
                startup: false,
                fixed: false,
                attrName: "test",
                operator: "EQ"
            });
            await wrapper.vm.$nextTick();
            expect(spyHandleActiveStrategy.calledOnce).to.be.true;
        });
    });
    describe("deleteRule", () => {
        it("should emit the update function", async () => {
            wrapper.vm.deleteRule(0);
            await wrapper.vm.$nextTick();
            expect(wrapper.emitted().updateRules).to.be.an("array").with.lengthOf(1);
        });
    });
    describe("deleteAllRules", () => {
        it("should emit the deleteAllRules function", async () => {
            wrapper.vm.deleteAllRules();
            await wrapper.vm.$nextTick();
            expect(wrapper.emitted().deleteAllRules).to.be.an("array").with.lengthOf(1);
        });
        it("should call handleActiveStrategy if strategy is active", async () => {
            const spyHandleActiveStrategy = sinon.spy(wrapper.vm, "handleActiveStrategy");

            await wrapper.setProps({layerConfig: {strategy: "active"}});
            wrapper.vm.deleteAllRules();
            await wrapper.vm.$nextTick();
            expect(spyHandleActiveStrategy.calledOnce).to.be.true;
        });
    });
    describe("hasUnfixedRules", () => {
        it("should return false if there are no rules with fixed=false", () => {
            const rules = {
                snippetId: 1,
                startup: false,
                fixed: true,
                attrName: "test",
                operator: "EQ"
            };

            expect(wrapper.vm.hasUnfixedRules(rules)).to.be.false;
        });
        it("should return true if there are rules with fixed=false in the rules", () => {
            const rules = [
                {
                    snippetId: 1,
                    startup: false,
                    fixed: true,
                    attrName: "test",
                    operator: "EQ"
                },
                {
                    snippetId: 0,
                    startup: false,
                    fixed: false,
                    attrName: "test",
                    operator: "EQ"
                }
            ];

            expect(wrapper.vm.hasUnfixedRules(rules)).to.be.true;
        });
    });
    describe("getTitle", () => {
        it("should return true if title is true", () => {
            expect(wrapper.vm.getTitle(true), 1).to.be.true;
        });
        it("should return the title if title is set", () => {
            expect(wrapper.vm.getTitle({title: "title"}, 1)).to.be.equal("title");
        });
        it("should return true if title is not set", () => {
            expect(wrapper.vm.getTitle({}, 1)).to.be.true;
        });
    });
    describe("getTagTitle", () => {
        it("should return value if there is no tagTitle defined", () => {
            expect(wrapper.vm.getTagTitle({value: "title"})).to.equal("title");
            expect(wrapper.vm.getTagTitle({value: false})).to.equal("false");
            expect(wrapper.vm.getTagTitle({value: 0})).to.equal("0");
            expect(wrapper.vm.getTagTitle({value: undefined})).to.equal("undefined");
            expect(wrapper.vm.getTagTitle({value: null})).to.equal("null");
        });
        it("should return tagTitle if there is tagTitle defined", () => {
            expect(wrapper.vm.getTagTitle({value: "title", tagTitle: "tagTitle"})).to.equal("tagTitle");
            expect(wrapper.vm.getTagTitle({value: "title", tagTitle: false})).to.equal("false");
            expect(wrapper.vm.getTagTitle({value: "title", tagTitle: 0})).to.equal("0");
            expect(wrapper.vm.getTagTitle({value: "title", tagTitle: null})).to.equal("null");
        });
    });
    describe("paging", () => {
        it("should show stop button if paging  was set", async () => {
            await wrapper.setData({
                paging: {
                    page: 1,
                    total: 46
                },
                showStop: true
            });

            expect(wrapper.find(".btn-secondary").exists()).to.be.true;
        });
    });
    describe("labelFilterButton", () => {
        it("should render correct name for label filter button", async () => {
            await wrapper.setData({
                layerConfig: {
                    labelFilterButton: "Drück mich"
                }
            });
            await wrapper.vm.$nextTick();
            expect(wrapper.find("button").text()).to.equal("Drück mich");
        });
    });
    it("should render SnippetTags if rules are given", async () => {
        const rules = [
            {
                snippetId: 1,
                startup: false,
                fixed: false,
                attrName: "test",
                operator: "EQ"
            },
            {
                snippetId: 2,
                startup: false,
                fixed: false,
                attrName: "testing",
                operator: "EQ"
            }
        ];

        await wrapper.setProps({
            filterRules: rules
        });
        expect(wrapper.findAll(".snippetTagsWrapper").exists()).to.be.true;
        expect(wrapper.findAll(".snippetTagsWrapper")).to.have.lengthOf(3);
    });
    it("should render amount of filtered items", async () => {
        await wrapper.setData({
            amountOfFilteredItems: 3
        });
        await wrapper.vm.$nextTick();
        expect(wrapper.find(".filter-result").exists()).to.be.true;
        expect(wrapper.find(".filter-result").text()).contain("modules.tools.filter.filterResult.unit", "3");
    });
    it("should not render amount of filtered items if showHits is false", async () => {
        await wrapper.setData({
            amountOfFilteredItems: 3,
            layerConfig: {
                showHits: false
            }
        });
        await wrapper.vm.$nextTick();
        expect(wrapper.find(".filter-result").exists()).to.be.false;
    });
    it("should render amount of filtered items if showHits is true", async () => {
        await wrapper.setData({
            amountOfFilteredItems: 3,
            layerConfig: {
                showHits: true
            }
        });
        await wrapper.vm.$nextTick();
        expect(wrapper.find(".filter-result").exists()).to.be.true;
        expect(wrapper.find(".filter-result").text()).contain("modules.tools.filter.filterResult.unit", "3");
    });
    it("should render amount of filtered items if showHits is undefined", async () => {
        await wrapper.setData({
            amountOfFilteredItems: 3,
            layerConfig: {
                showHits: undefined
            }
        });
        await wrapper.vm.$nextTick();
        expect(wrapper.find(".filter-result").exists()).to.be.true;
        expect(wrapper.find(".filter-result").text()).contain("modules.tools.filter.filterResult.unit", "3");
    });
    it("should render SnippetDownload component if download is true and filteredItems are given", async () => {
        await wrapper.setData({
            layerConfig: {
                download: true
            },
            filteredItems: [
                {
                    a: "a",
                    b: "b"
                }
            ]
        });
        await wrapper.vm.$nextTick();
        expect(wrapper.findComponent(SnippetDownload).exists()).to.be.true;
    });

    it("should render a spinner", async () => {
        await wrapper.setData({
            isLoading: true
        });

        expect(wrapper.find(".spinner-border").exists()).to.be.true;
    });

    it("should call 'activateLayer' if filter layer type is VectorTile and the layer is not yet loaded", () => {
        mapHandler.getLayerModelByFilterId = sinon.stub().returns({
            get: (val) => {
                if (val === "isSelected") {
                    return false;
                }
                return "VectorTile";
            }
        });
        mapHandler.activateLayer = sinon.stub();
        wrapper = shallowMount(LayerFilterSnippet, {
            propsData: {
                layerConfig: {
                    service: {
                        type: "something external"
                    },
                    searchInMapExtent: true
                },
                mapHandler
            },
            localVue
        });

        expect(mapHandler.activateLayer.calledOnce).to.be.true;
    });

    describe("setSnippetValueByState", async () => {
        await wrapper.setData({
            snippets
        });

        const filterRules = [
                {
                    snippetId: 0,
                    startup: false,
                    fixed: false,
                    attrName: "test",
                    operator: "EQ",
                    value: ["Altona"]
                }
            ],
            snippets = [
                {
                    operator: "EQ",
                    snippetId: 0,
                    title: "Bezirk",
                    type: "dropdown",
                    value: ["Altona"]
                }],
            precheckedSnippets = [{
                operator: "EQ",
                snippetId: 0,
                title: "Bezirk",
                type: "dropdown",
                value: ["Altona"],
                prechecked: ["Altona"]
            }];

        it("should not set prechecked value if param is not an array", () => {
            wrapper.vm.setSnippetValueByState(undefined);
            wrapper.vm.setSnippetValueByState(null);
            wrapper.vm.setSnippetValueByState(123456);
            wrapper.vm.setSnippetValueByState("string");
            wrapper.vm.setSnippetValueByState(true);
            wrapper.vm.setSnippetValueByState({});

            expect(wrapper.vm.snippets).to.deep.equal(snippets);
        });
        it("should not set prechecked value if given structure is not a rule", () => {
            const isRuleStub = sinon.stub(LayerFilterSnippet, "isRule").returns(false),
                noRule = [
                    {
                        something: "something"
                    }
                ];

            wrapper.vm.setSnippetValueByState(noRule);

            expect(wrapper.vm.snippets).to.deep.equal(snippets);
            expect(isRuleStub.called).to.be.true;
            sinon.restore();
        });
        it("should set prechecked value if correct filter rule is given", () => {
            wrapper.vm.setSnippetValueByState(filterRules);

            expect(wrapper.vm.snippets).to.deep.equal(precheckedSnippets);
        });
    });
    describe("isParentSnippet", () => {
        it("should return true if snippet is an object and has children", async () => {
            const snippets = [
                {
                    operator: "EQ",
                    snippetId: 0,
                    type: "dropdown",
                    children: [
                        {
                            a: "a",
                            b: "b"
                        }
                    ]
                }
            ];

            await wrapper.setData({
                snippets
            });
            await wrapper.vm.$nextTick();
            expect(wrapper.vm.isParentSnippet(0)).to.be.true;
        });
        it("should return false if snippet is an object and has no children", async () => {
            const snippets = [
                {
                    operator: "EQ",
                    snippetId: 0,
                    type: "dropdown"
                }
            ];

            await wrapper.setData({
                snippets
            });
            await wrapper.vm.$nextTick();
            expect(wrapper.vm.isParentSnippet(0)).to.be.false;
        });
    });
    describe("hasParentSnippet", () => {
        it("should return true if snippet is an object and has parent snippet", async () => {
            const snippets = [
                {
                    operator: "EQ",
                    snippetId: 0,
                    type: "dropdown",
                    parent:
                    {
                        a: "a",
                        b: "b"
                    }
                }
            ];

            await wrapper.setData({
                snippets
            });
            await wrapper.vm.$nextTick();
            expect(wrapper.vm.hasParentSnippet(0)).to.be.true;
        });
        it("should return false if snippet is not an object and has no parent", async () => {
            const snippets = [
                {
                    operator: "EQ",
                    snippetId: 0,
                    type: "dropdown"
                }
            ];

            await wrapper.setData({
                snippets
            });
            await wrapper.vm.$nextTick();
            expect(wrapper.vm.hasParentSnippet(0)).to.be.false;
        });
    });
    describe("deleteRulesOfChildren", () => {
        it("should not emit updateRules if parent is not an Object or an Array or his children are not an array", () => {
            wrapper.vm.deleteRulesOfChildren(true);
            expect(wrapper.emitted().updateRules).to.be.undefined;
            wrapper.vm.deleteRulesOfChildren(123456);
            expect(wrapper.emitted().updateRules).to.be.undefined;
            wrapper.vm.deleteRulesOfChildren("String");
            expect(wrapper.emitted().updateRules).to.be.undefined;
            wrapper.vm.deleteRulesOfChildren(null);
            expect(wrapper.emitted().updateRules).to.be.undefined;
            wrapper.vm.deleteRulesOfChildren(undefined);
            expect(wrapper.emitted().updateRules).to.be.undefined;
        });
        it("should emit updateRules", async () => {
            await wrapper.setData({
                layerConfig: {
                    filterId: 0
                }
            });
            const parentSnippets =
                {
                    operator: "EQ",
                    snippetId: 0,
                    title: "Bezirk",
                    type: "dropdown",
                    children: [
                        {
                            operator: "EQ",
                            snippetId: 0
                        }
                    ]
                };

            wrapper.vm.deleteRulesOfChildren(parentSnippets);
            await wrapper.vm.$nextTick();
            expect(wrapper.emitted().updateRules).to.be.an("array").with.lengthOf(1);
        });

    });
    describe("hasOnlyParentRules", () => {
        it("should return true if filterRules and parent snippet are given", async () => {
            const stubIsRule = sinon.stub(wrapper.vm, "isRule").returns(true),
                stubIsParentSnippet = sinon.stub(wrapper.vm, "isParentSnippet").returns(true);

            await wrapper.setProps({
                filterRules: [
                    {
                        snippetId: 0,
                        startup: false,
                        fixed: false,
                        attrName: "test",
                        operator: "EQ"
                    }
                ]
            });

            await wrapper.vm.$nextTick();
            expect(wrapper.vm.hasOnlyParentRules()).to.be.true;
            expect(stubIsRule.called).to.be.true;
            expect(stubIsParentSnippet.called).to.be.true;
        });
        it("should return false if filterRules are given and snipppet is not a parent", async () => {
            const stubIsRule = sinon.stub(wrapper.vm, "isRule").returns(true),
                stubIsParentSnippet = sinon.stub(wrapper.vm, "isParentSnippet").returns(false);

            await wrapper.setProps({
                filterRules: [
                    {
                        snippetId: 0,
                        startup: false,
                        fixed: false,
                        attrName: "test",
                        operator: "EQ"
                    }
                ]
            });

            await wrapper.vm.$nextTick();
            expect(wrapper.vm.hasOnlyParentRules()).to.be.false;
            expect(stubIsRule.called).to.be.true;
            expect(stubIsParentSnippet.called).to.be.true;
        });
        it("should return false if filterRules is not a rule", async () => {
            const stubIsRule = sinon.stub(wrapper.vm, "isRule").returns(false),
                stubIsParentSnippet = sinon.stub(wrapper.vm, "isParentSnippet").returns(false);

            await wrapper.setProps({
                filterRules: [
                    {
                        snippetId: 0,
                        startup: false,
                        fixed: false,
                        attrName: "test",
                        operator: "EQ"
                    }
                ]
            });

            await wrapper.vm.$nextTick();
            expect(wrapper.vm.hasOnlyParentRules()).to.be.false;
            expect(stubIsRule.called).to.be.true;
            expect(stubIsParentSnippet.called).to.be.false;
        });
    });

    describe("checkZoomLevel", () => {
        it("should not call the function checkZoomLevel", async () => {
            const checkZoomLevel = sinon.stub(wrapper.vm, "checkZoomLevel");

            LayerFilterSnippet.methods.checkZoomLevel = checkZoomLevel;

            wrapper = shallowMount(LayerFilterSnippet, {
                propsData: {
                    layerConfig: {
                        service: {
                            type: "something external"
                        }
                    },
                    mapHandler
                },
                localVue
            });

            await wrapper.vm.$nextTick();
            wrapper.destroy();

            expect(wrapper.vm.checkZoomLevel).to.be.a("function");
            expect(checkZoomLevel.notCalled).to.be.true;
        });

        it("should call the function checkZoomLevel", async () => {
            const checkZoomLevel = sinon.stub(wrapper.vm, "checkZoomLevel");

            LayerFilterSnippet.methods.checkZoomLevel = checkZoomLevel;

            wrapper = shallowMount(LayerFilterSnippet, {
                propsData: {
                    layerConfig: {
                        service: {
                            type: "something external"
                        },
                        "minZoom": 15,
                        "maxZoom": 18
                    },
                    mapHandler
                },
                localVue
            });

            await wrapper.vm.$nextTick();
            wrapper.destroy();

            expect(checkZoomLevel.called).to.be.true;
        });
    });

    describe("checkOutOfZoomLevel", () => {
        it("should set the variable outOfZoom false", () => {
            expect(wrapper.vm.checkOutOfZoomLevel(undefined, undefined, undefined)).to.be.false;
            expect(wrapper.vm.checkOutOfZoomLevel(undefined, undefined, 17)).to.be.false;
            expect(wrapper.vm.checkOutOfZoomLevel(undefined, 18, 17)).to.be.false;
            expect(wrapper.vm.checkOutOfZoomLevel(10, undefined, 17)).to.be.false;
            expect(wrapper.vm.checkOutOfZoomLevel(10, 18, 17)).to.be.false;
        });
        it("should set the variable outOfZoom true", () => {
            expect(wrapper.vm.checkOutOfZoomLevel(10, 16, 17)).to.be.true;
            expect(wrapper.vm.checkOutOfZoomLevel(10, 18, 7)).to.be.true;
            expect(wrapper.vm.checkOutOfZoomLevel(10, undefined, 7)).to.be.true;
            expect(wrapper.vm.checkOutOfZoomLevel(undefined, 16, 17)).to.be.true;
        });
    });
});
