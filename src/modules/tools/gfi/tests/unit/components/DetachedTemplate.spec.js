import Vuex from "vuex";
import {config, mount, shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";
import DetachedTemplate from "../../../components/templates/DetachedTemplate.vue";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import Polygon from "ol/geom/Polygon";
import LineString from "ol/geom/LineString";

const localVue = createLocalVue();

config.mocks.$t = key => key;
localVue.use(Vuex);

describe("src/modules/tools/gfi/components/templates/DetachedTemplate.vue", () => {
    let store,
        highlightVectorRules,
        getLayerByIdSpy,
        highlightFeatureSpy,
        removeHighlightFeatureSpy;
    const mockMutations = {
            setCurrentFeature: () => sinon.stub(),
            setShowMarker: () => SVGTextPositioningElement.stub()
        },
        mockGetters = {
            centerMapToClickPoint: () => sinon.stub(),
            showMarker: () => sinon.stub(),
            highlightVectorRules: () => highlightVectorRules,
            currentFeature: () => sinon.stub()
        },
        olFeature = new Feature({
            name: "feature123"
        });

    before(() => {
        mapCollection.clear();
        const map = {
            id: "ol",
            mode: "2D"
        };

        mapCollection.addMap(map, "2D");
    });

    beforeEach(() => {
        olFeature.setId("feature1");
        olFeature.setGeometry(new Point([10, 10]));
        getLayerByIdSpy = sinon.spy();
        highlightFeatureSpy = sinon.spy();
        removeHighlightFeatureSpy = sinon.spy();
        highlightVectorRules = {
            image: {
                scale: 10
            },
            fill: sinon.stub(),
            stroke: sinon.stub()
        };
        store = getStore();
    });

    /**
     * Creates test store.
     * @returns {Object} the test store
     */
    function getStore () {
        return new Vuex.Store({
            namespaced: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        Gfi: {
                            namespaced: true,
                            mutations: mockMutations,
                            getters: mockGetters
                        }
                    }
                },
                Maps: {
                    namespaced: true,
                    actions: {
                        removeHighlightFeature: removeHighlightFeatureSpy,
                        highlightFeature: highlightFeatureSpy,
                        setCenter: sinon.stub()
                    },
                    getters: {
                        clickCoordinate: sinon.stub(),
                        getLayerById: () => getLayerByIdSpy
                    }
                },
                MapMarker: {
                    namespaced: true,
                    actions: {
                        removePointMarker: sinon.stub(),
                        placingPointMarker: sinon.stub()
                    }
                }
            }
        });
    }

    it("should have a title", () => {
        const wrapper = mount(DetachedTemplate, {
            propsData: {
                feature: {
                    getTheme: () => "Default",
                    getTitle: () => "Hallo",
                    getMimeType: () => "text/xml",
                    getGfiUrl: () => "",
                    getLayerId: () => sinon.stub(),
                    getOlFeature: () => olFeature
                }
            },
            components: {
                DefaultTheme: {
                    name: "DefaultTheme",
                    template: "<span />"
                }
            },
            computed: {
                styleAll: () => [{
                    "right": ""
                }],
                styleContent: () => [{
                    "max-width": "",
                    "max-height": ""
                }]
            },
            store: store,
            localVue
        });

        expect(wrapper.find("span").text()).to.be.equal("Hallo");
    });

    it("should have the child component default (-Theme)", () => {
        const wrapper = mount(DetachedTemplate, {
            propsData: {
                feature: {
                    getTheme: () => "default",
                    getTitle: () => "Hallo",
                    getMimeType: () => "text/xml",
                    getGfiUrl: () => "",
                    getLayerId: () => sinon.stub(),
                    getOlFeature: () => olFeature
                }
            },
            components: {
                DefaultTheme: {
                    name: "DefaultTheme",
                    template: "<span />"
                }
            },
            computed: {
                styleAll: () => [{
                    "right": ""
                }],
                styleContent: () => [{
                    "max-width": "",
                    "max-height": ""
                }]
            },
            store: store,
            localVue
        });

        expect(wrapper.findComponent({name: "DefaultTheme"}).exists()).to.be.true;
    });

    it("should have a close button", async () => {
        const wrapper = mount(DetachedTemplate, {
            propsData: {
                feature: {
                    getTheme: () => "default",
                    getTitle: () => "Hallo",
                    getMimeType: () => "text/xml",
                    getGfiUrl: () => "",
                    getLayerId: () => sinon.stub(),
                    getOlFeature: () => olFeature
                }
            },
            components: {
                DefaultTheme: {
                    name: "DefaultTheme",
                    template: "<span />"
                }
            },
            store: store,
            localVue
        });

        expect(wrapper.find("span.bootstrap-icon > .bi-x-lg").exists()).to.be.true;
    });


    it("should emitted close event if button is clicked", async () => {
        const wrapper = mount(DetachedTemplate, {
                propsData: {
                    feature: {
                        getTheme: () => "default",
                        getTitle: () => "Hallo",
                        getMimeType: () => "text/xml",
                        getGfiUrl: () => "",
                        getLayerId: () => sinon.stub(),
                        getOlFeature: () => olFeature
                    }
                },
                components: {
                    DefaultTheme: {
                        name: "DefaultTheme",
                        template: "<span />"
                    }
                },
                store: store,
                localVue
            }),
            button = wrapper.find("span.bootstrap-icon > .bi-x-lg");

        await button.trigger("click");
        expect(wrapper.emitted()).to.have.property("close");
        expect(wrapper.emitted().close).to.have.lengthOf(1);
    });

    it("should not emitted close event if clicked inside the content", async () => {
        const wrapper = mount(DetachedTemplate, {
                propsData: {
                    feature: {
                        getTheme: () => "default",
                        getTitle: () => "Hallo",
                        getMimeType: () => "text/xml",
                        getGfiUrl: () => "",
                        getLayerId: () => sinon.stub(),
                        getOlFeature: () => olFeature
                    }
                },
                components: {
                    DefaultTheme: {
                        name: "DefaultTheme",
                        template: "<span />"
                    }
                },
                store: store,
                localVue
            }),
            modal = wrapper.find(".vue-tool-content-body");

        await modal.trigger("click");
        expect(wrapper.emitted()).to.not.have.property("close");
        expect(wrapper.emitted()).to.be.empty;
    });

    it("should render the footer slot within .gfi-footer", () => {
        const wrapper = mount(DetachedTemplate, {
                propsData: {
                    feature: {
                        getTheme: () => "default",
                        getTitle: () => "Hallo",
                        getMimeType: () => "text/xml",
                        getGfiUrl: () => "",
                        getLayerId: () => sinon.stub(),
                        getOlFeature: () => olFeature
                    }
                },
                components: {
                    DefaultTheme: {
                        name: "DefaultTheme",
                        template: "<span />"
                    }
                },
                slots: {
                    footer: "<div class=\"gfi-footer\">Footer</div>"
                },
                store: store,
                localVue
            }),
            footer = wrapper.find(".gfi-footer");

        expect(footer.text()).to.be.equal("Footer");
    });

    it("should set 'isContentHtml' to true", async () => {
        const wrapper = mount(DetachedTemplate, {
            propsData: {
                feature: {
                    getTheme: () => "default",
                    getTitle: () => "Hallo",
                    getMimeType: () => "text/html",
                    getGfiUrl: () => "http",
                    getLayerId: () => sinon.stub(),
                    getOlFeature: () => olFeature
                }
            },
            components: {
                DefaultTheme: {
                    name: "DefaultTheme",
                    template: "<span />"
                }
            },
            store: store,
            localVue
        });

        expect(wrapper.vm.isContentHtml).to.be.true;
    });

    it("should not set 'isContentHtml' to true", async () => {
        const wrapper = mount(DetachedTemplate, {
            propsData: {
                feature: {
                    getTheme: () => "DefaultTheme",
                    getTitle: () => "Hallo",
                    getMimeType: () => "text/xml",
                    getGfiUrl: () => "",
                    getLayerId: () => sinon.stub(),
                    getOlFeature: () => olFeature
                }
            },
            components: {
                DefaultTheme: {
                    name: "DefaultTheme",
                    template: "<span />"
                }
            },
            store: store,
            localVue
        });

        expect(wrapper.vm.isContentHtml).to.be.false;
    });
    describe("Lifecycle Hooks", () => {
        it("should emit 'updateFeatureDone' in updated hook if isUpdated is true", async () => {
            const wrapper = mount(DetachedTemplate, {
                propsData: {
                    feature: {
                        getTheme: () => "DefaultTheme",
                        getTitle: () => "Hallo",
                        getMimeType: () => "text/xml",
                        getGfiUrl: () => "",
                        getLayerId: () => sinon.stub(),
                        getOlFeature: () => olFeature
                    }
                },
                components: {
                    DefaultTheme: {
                        name: "DefaultTheme",
                        template: "<span />"
                    }
                },
                store: store,
                localVue
            });

            await wrapper.setProps({isUpdated: true});
            await wrapper.vm.$nextTick();

            expect(wrapper.emitted()).to.have.property("updateFeatureDone");
            expect(wrapper.emitted().updateFeatureDone).to.have.lengthOf(1);
        });
    });
    describe("methods", () => {
        describe("highlightVectorFeature", () => {
            it("should do nothing, if highlightVectorRules is not set", () => {
                highlightVectorRules = null;

                const wrapper = shallowMount(DetachedTemplate, {
                    propsData: {
                        feature: {
                            getTheme: () => "DefaultTheme",
                            getTitle: () => "Hallo",
                            getMimeType: () => "text/xml",
                            getGfiUrl: () => "",
                            getLayerId: () => sinon.stub(),
                            getOlFeature: () => olFeature
                        }
                    },
                    components: {
                        DefaultTheme: {
                            name: "DefaultTheme",
                            template: "<span />"
                        }
                    },
                    store: getStore(),
                    localVue
                });

                wrapper.vm.highlightVectorFeature();
                expect(getLayerByIdSpy.notCalled).to.be.true;
                expect(highlightFeatureSpy.notCalled).to.be.true;
            });

            it("should call highlightFeature if feature's geometry is a point", () => {
                const expectedArgs = {
                    feature: olFeature,
                    type: "increase",
                    scale: highlightVectorRules.image.scale,
                    layer: {id: "layerId"},
                    styleId: undefined
                };

                shallowMount(DetachedTemplate, {
                    propsData: {
                        feature: {
                            getTheme: () => "DefaultTheme",
                            getTitle: () => "Hallo",
                            getMimeType: () => "text/xml",
                            getGfiUrl: () => "",
                            getLayerId: () => "layerId",
                            getOlFeature: () => olFeature
                        }
                    },
                    components: {
                        DefaultTheme: {
                            name: "DefaultTheme",
                            template: "<span />"
                        }
                    },
                    store: getStore(),
                    localVue
                });

                expect(getLayerByIdSpy.calledOnce).to.be.true;
                expect(removeHighlightFeatureSpy.calledOnce).to.be.true;
                expect(highlightFeatureSpy.calledOnce).to.be.true;
                expect(highlightFeatureSpy.firstCall.args[1]).to.be.deep.equals(expectedArgs);
            });

            it("should call highlightFeature if feature's geometry is a polygon - test styleId", () => {
                const expectedArgs = {
                    feature: olFeature,
                    type: "highlightPolygon",
                    highlightStyle: {
                        fill: highlightVectorRules.fill,
                        stroke: highlightVectorRules.stroke
                    },
                    layer: {id: "layerId"},
                    styleId: "styleId"
                };

                olFeature.setGeometry(new Polygon([[[30, 10], [40, 40], [130, 130], [240, 40], [30, 10]]]));
                getLayerByIdSpy = sinon.stub().returns({
                    get: () => "styleId"
                });
                shallowMount(DetachedTemplate, {
                    propsData: {
                        feature: {
                            getTheme: () => "DefaultTheme",
                            getTitle: () => "Hallo",
                            getMimeType: () => "text/xml",
                            getGfiUrl: () => "",
                            getLayerId: () => "layerId",
                            getOlFeature: () => olFeature
                        }
                    },
                    components: {
                        DefaultTheme: {
                            name: "DefaultTheme",
                            template: "<span />"
                        }
                    },
                    store: getStore(),
                    localVue
                });

                expect(getLayerByIdSpy.calledOnce).to.be.true;
                expect(removeHighlightFeatureSpy.calledOnce).to.be.true;
                expect(highlightFeatureSpy.calledOnce).to.be.true;
                expect(highlightFeatureSpy.firstCall.args[1]).to.be.deep.equals(expectedArgs);
            });
            it("should call highlightFeature if feature's geometry is a linestring", () => {
                const expectedArgs = {
                    feature: olFeature,
                    type: "highlightLine",
                    highlightStyle: {
                        stroke: highlightVectorRules.stroke
                    },
                    layer: {id: "layerId"},
                    styleId: "styleId"
                };

                olFeature.setGeometry(new LineString([[30, 10], [40, 40], [130, 130], [240, 40]]));
                getLayerByIdSpy = sinon.stub().returns({
                    get: () => "styleId"
                });
                shallowMount(DetachedTemplate, {
                    propsData: {
                        feature: {
                            getTheme: () => "DefaultTheme",
                            getTitle: () => "Hallo",
                            getMimeType: () => "text/xml",
                            getGfiUrl: () => "",
                            getLayerId: () => "layerId",
                            getOlFeature: () => olFeature
                        }
                    },
                    components: {
                        DefaultTheme: {
                            name: "DefaultTheme",
                            template: "<span />"
                        }
                    },
                    store: getStore(),
                    localVue
                });

                expect(getLayerByIdSpy.calledOnce).to.be.true;
                expect(removeHighlightFeatureSpy.calledOnce).to.be.true;
                expect(highlightFeatureSpy.calledOnce).to.be.true;
                expect(highlightFeatureSpy.firstCall.args[1]).to.be.deep.equals(expectedArgs);
            });
        });
    });

});
