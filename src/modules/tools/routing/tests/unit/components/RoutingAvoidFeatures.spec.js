import Vuex from "vuex";
import {expect} from "chai";
import sinon from "sinon";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import RoutingAvoidFeaturesComponent from "../../../components/RoutingAvoidFeatures.vue";
import mutations from "../../../store/mutationsRouting";
import actions from "../../../store/actionsRouting";
import getters from "../../../store/gettersRouting";
import state from "../../../store/stateRouting";
import Directions from "../../../store/directions/indexDirections";
import Isochrones from "../../../store/isochrones/indexIsochrones";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/tools/routing/components/RoutingAvoidFeatures.vue", () => {
    const mockConfigJson = {
        Portalconfig: {
            menu: {
                tools: {
                    children: {
                        routing:
                            {
                                "name": "translate#common:menu.tools.routing",
                                "icon": "bi-signpost-2-fill",
                                "renderToWindow": true
                            }
                    }
                }
            }
        }
    };
    let store,
        wrapper;

    beforeEach(() => {
        const map = {
            id: "ol",
            mode: "2D",
            addLayer: sinon.spy(),
            removeLayer: sinon.spy(),
            addInteraction: sinon.spy(),
            removeInteraction: sinon.spy()
        };

        mapCollection.clear();
        mapCollection.addMap(map, "ol", "2D");
        store = new Vuex.Store({
            namespaced: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        Routing:
                        {
                            namespaced: true,
                            modules: {
                                Directions,
                                Isochrones
                            },
                            state: {...state},
                            mutations,
                            actions,
                            getters
                        }
                    }
                }
            },
            state: {
                configJson: mockConfigJson,
                Map: {
                    mapId: "ol",
                    mapMode: "2D"
                }
            }
        });
    });

    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
    });

    it("renders RoutingAvoidFeatures", () => {
        wrapper = shallowMount(RoutingAvoidFeaturesComponent, {
            store,
            localVue,
            data: () => ({
                showAvoidFeatures: true
            }),
            propsData: {
                activeAvoidFeaturesOptions: [],
                settings: {
                    speedProfile: "PKW"
                }
            }
        });
        expect(wrapper.find("#routing-avoid-features").exists()).to.be.true;
    });

    it("renders RoutingAvoidFeaturesOptions", () => {
        wrapper = shallowMount(RoutingAvoidFeaturesComponent, {
            store,
            localVue,
            data: () => ({
                showAvoidFeatures: true
            }),
            propsData: {
                activeAvoidFeaturesOptions: [],
                settings: {
                    speedProfile: "PKW"
                }
            }
        });
        expect(wrapper.find("#routing-avoid-features-options").exists()).to.be.true;
    });

    it("does not render RoutingAvoidFeaturesOptions", () => {
        wrapper = shallowMount(RoutingAvoidFeaturesComponent, {
            store,
            localVue,
            data: () => ({
                showAvoidFeatures: false
            }),
            propsData: {
                activeAvoidFeaturesOptions: [],
                settings: {
                    speedProfile: "PKW"
                }
            }
        });
        expect(wrapper.find("#routing-avoid-features-options").exists()).to.be.false;
    });


    it("checks input checked", () => {
        wrapper = shallowMount(RoutingAvoidFeaturesComponent, {
            store,
            localVue,
            data: () => ({
                showAvoidFeatures: true
            }),
            propsData: {
                activeAvoidFeaturesOptions: ["HIGHWAYS"],
                settings: {
                    speedProfile: "CAR"
                }
            }
        });
        expect(wrapper.find("#routing-avoid-features-option-input-HIGHWAYS").element.checked).to.be.true;
    });

    it("checks input not checked", () => {
        wrapper = shallowMount(RoutingAvoidFeaturesComponent, {
            store,
            localVue,
            data: () => ({
                showAvoidFeatures: true
            }),
            propsData: {
                activeAvoidFeaturesOptions: [],
                settings: {
                    speedProfile: "CAR"
                }
            }
        });
        expect(wrapper.find("#routing-avoid-features-option-input-HIGHWAYS").element.checked).to.be.false;
    });

    it("checks input disabled", () => {
        wrapper = shallowMount(RoutingAvoidFeaturesComponent, {
            store,
            localVue,
            data: () => ({
                showAvoidFeatures: true
            }),
            propsData: {
                activeAvoidFeaturesOptions: ["HIGHWAYS"],
                settings: {
                    speedProfile: "CAR"
                },
                disabled: true
            }
        });
        expect(wrapper.find("#routing-avoid-features-option-input-HIGHWAYS").element.disabled).to.be.true;
    });

    it("checks input not disabled", () => {
        wrapper = shallowMount(RoutingAvoidFeaturesComponent, {
            store,
            localVue,
            data: () => ({
                showAvoidFeatures: true
            }),
            propsData: {
                activeAvoidFeaturesOptions: ["HIGHWAYS"],
                settings: {
                    speedProfile: "CAR"
                },
                disabled: false
            }
        });
        expect(wrapper.find("#routing-avoid-features-option-input-HIGHWAYS").element.disabled).to.be.false;
    });

    it("checks input emit on adding feature to be avoided", async () => {
        wrapper = shallowMount(RoutingAvoidFeaturesComponent, {
            store,
            localVue,
            data: () => ({
                showAvoidFeatures: true
            }),
            propsData: {
                activeAvoidFeaturesOptions: [],
                settings: {
                    speedProfile: "CAR"
                }
            }
        });
        const input = wrapper.find("#routing-avoid-features-option-input-HIGHWAYS");

        input.element.checked = true;
        input.trigger("change");
        await wrapper.vm.$nextTick();
        expect(wrapper.emitted().addAvoidOption.length).equal(1);
        expect(wrapper.emitted().addAvoidOption[0]).deep.to.equal(["HIGHWAYS"]);
    });

    it("checks input emit on removing feature to be avoided", async () => {
        wrapper = shallowMount(RoutingAvoidFeaturesComponent, {
            store,
            localVue,
            data: () => ({
                showAvoidFeatures: true
            }),
            propsData: {
                activeAvoidFeaturesOptions: ["HIGHWAYS"],
                settings: {
                    speedProfile: "CAR"
                }
            }
        });
        const input = wrapper.find("#routing-avoid-features-option-input-HIGHWAYS");

        input.element.checked = false;
        input.trigger("change");
        await wrapper.vm.$nextTick();
        expect(wrapper.emitted().removeAvoidOption.length).equal(1);
        expect(wrapper.emitted().removeAvoidOption[0]).deep.to.equal(["HIGHWAYS"]);
    });
    it("checks updateAvoidSpeedProfileOptions to add speedProfile", async () => {
        wrapper = shallowMount(RoutingAvoidFeaturesComponent, {
            store,
            localVue,
            data: () => ({
                avoidSpeedProfileOptionsConstants: [{id: "HIGHWAYS", availableProfiles: ["CYCLING"]}],
                showAvoidFeatures: true
            }),
            propsData: {
                settings: {
                    speedProfile: "CYCLING"
                }
            }
        });
        wrapper.vm.updateAvoidSpeedProfileOptions("HIGHWAYS", "CAR");
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.avoidSpeedProfileOptionsConstants[0].availableProfiles).deep.to.equal(["CYCLING", "CAR"]);
    });
    it("checks updateAvoidSpeedProfileOptions to add speedProfile with new avoidFeature", async () => {
        wrapper = shallowMount(RoutingAvoidFeaturesComponent, {
            store,
            localVue,
            data: () => ({
                avoidSpeedProfileOptionsConstants: [{id: "HIGHWAYS", availableProfiles: ["CYCLING"]}],
                showAvoidFeatures: true
            }),
            propsData: {
                settings: {
                    speedProfile: "CYCLING"
                }
            }
        });
        wrapper.vm.updateAvoidSpeedProfileOptions("New", "CAR");
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.avoidSpeedProfileOptionsConstants[1].id).deep.to.equal("New");
    });
    it("removes existing speedProfile from avoidSpeedProfileOptionsConstants", async () => {
        wrapper = shallowMount(RoutingAvoidFeaturesComponent, {
            store,
            localVue,
            data: () => ({
                avoidSpeedProfileOptionsConstants: [{id: "HIGHWAYS", availableProfiles: ["CYCLING", "CAR"]}],
                showAvoidFeatures: true
            }),
            propsData: {
                settings: {
                    speedProfile: "CYCLING"
                }
            }
        });
        wrapper.vm.removeDefaultSetting("CAR");
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.avoidSpeedProfileOptionsConstants[0].availableProfiles).deep.to.equal(["CYCLING"]);
    });
    it("syncs the avoidFeatures from configs", async () => {
        wrapper = shallowMount(RoutingAvoidFeaturesComponent, {
            store,
            localVue,
            data: () => ({
                avoidSpeedProfileOptionsConstants: [{id: "HIGHWAYS", availableProfiles: ["CYCLING"]}],
                showAvoidFeatures: true
            }),
            propsData: {
                settings: {
                    speedProfile: "CYCLING"
                }
            }
        });
        wrapper.vm.syncAvoidFeatures({"CAR": ["HIGHWAYS"]});
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.avoidSpeedProfileOptionsConstants[0].availableProfiles).deep.to.equal(["CYCLING", "CAR"]);
    });
});
