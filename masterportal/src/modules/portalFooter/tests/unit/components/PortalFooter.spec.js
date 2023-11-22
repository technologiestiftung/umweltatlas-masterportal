import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import PortalFooterComponent from "../../../components/PortalFooter.vue";
import {expect} from "chai";
import sinon from "sinon";

const localVue = createLocalVue();

config.mocks.$t = key => key;
config.mocks.$i18n = {
    i18next: {
        options: {
            isEnabled: () => sinon.stub(),
            getLanguages: () => sinon.stub()
        }
    }
};

localVue.use(Vuex);

describe("src/modules/portalFooter/components/PortalFooter.vue", () => {
    const urls = [{
            "bezeichnung": "abc",
            "url": "https://abc.de",
            "alias": "ABC",
            "alias_mobil": "ABC"
        },
        {
            "bezeichnung": "",
            "url": "",
            "alias": "SDP Download",
            "toolModelId": "SdpDownload"
        }],
        footerInfo = [{
            title: "Titel",
            description: "Test description",
            subtexts: [
                {
                    subtitle: "Subtitle",
                    text: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua."
                },
                {
                    subtitle: "Another subtitle",
                    text: "At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet."
                }
            ]
        }],
        mockConfigJs = {
            footer: {
                urls: urls,
                showVersion: false,
                footerInfo: footerInfo,
                mobileFooterInfoToggler: false
            }
        };
    let store,
        toggler;

    beforeEach(() => {
        toggler = false;
        store = new Vuex.Store({
            namespaced: true,
            modules: {
                PortalFooter: {
                    namespaced: true,
                    getters: {
                        showFooter: () => true,
                        urls: () => urls,
                        showVersion: () => true,
                        footerInfo: () => true,
                        mobileFooterInfoToggler: () => toggler,
                        isShortMenuOpen: () => true,
                        showShortMenu: () => false,
                        seperator: () => true,
                        infoTitles: () => sinon.stub()
                    },
                    mutations: {
                        setShowFooter: () => sinon.stub(),
                        setShowVersion: () => sinon.stub(),
                        setFooterInfo: () => sinon.stub(),
                        setMobileFooterInfoToggler: () => sinon.stub(),
                        setShowShortMenu: () => sinon.stub()
                    },
                    actions: {
                        initialize: sinon.stub(),
                        renderFooterInfo: sinon.stub()
                    }
                },
                Maps: {
                    namespaced: true,
                    getters: {
                        is3D: () => false
                    }
                }
            },
            state: {
                configJs: mockConfigJs
            },
            mutations: {
                configJs (state, value) {
                    state.configJs = value;
                }
            }
        });
    });
    afterEach(sinon.restore);

    it("renders the footer", () => {
        const wrapper = shallowMount(PortalFooterComponent, {
            store,
            computed: {
                footerConfig: () => sinon.stub(),
                masterPortalVersionNumber: () => sinon.stub(),
                mobile: () => sinon.stub()
            },
            localVue
        });

        expect(wrapper.find("#portal-footer").exists()).to.be.true;
    });

    it("renders the masterportal version in footer", () => {
        store.commit("PortalFooter/setShowVersion", true);
        const wrapper = shallowMount(PortalFooterComponent, {
            store,
            computed: {
                footerConfig: () => sinon.stub(),
                masterPortalVersionNumber: () => sinon.stub(),
                mobile: () => sinon.stub()
            },
            localVue
        });

        expect(wrapper.find(".d-none.d-md-block").exists()).to.be.true;
    });

    it("renders the urls in footer", async () => {
        const wrapper = shallowMount(PortalFooterComponent, {
            store,
            computed: {
                footerConfig: () => sinon.stub(),
                masterPortalVersionNumber: () => sinon.stub(),
                mobile: () => sinon.stub()
            },
            localVue
        });

        await wrapper.vm.$nextTick();

        expect(wrapper.find("a").exists()).to.be.true;
        expect(wrapper.find("a").text()).to.equals("ABC");
        expect(wrapper.find("a").attributes().href).to.equals("https://abc.de");
    });
    it("renders the footerInfo in footer", async () => {
        const wrapper = shallowMount(PortalFooterComponent, {
            store,
            computed: {
                footerConfig: () => sinon.stub(),
                masterPortalVersionNumber: () => sinon.stub(),
                mobile: () => sinon.stub()
            },
            localVue
        });

        await wrapper.vm.$nextTick();

        expect(wrapper.find("#footerInfo").exists()).to.be.true;

    });
    it("renders link to start tool in footer", async () => {
        const wrapper = shallowMount(PortalFooterComponent, {
            store,
            computed: {
                footerConfig: () => sinon.stub(),
                masterPortalVersionNumber: () => sinon.stub(),
                mobile: () => false
            },
            localVue
        });
        let aTags = null;

        await wrapper.vm.$nextTick();
        aTags = wrapper.findAll("a");

        expect(aTags.at(1).exists()).to.be.true;
        expect(aTags.at(1).text()).to.equals("SDP Download");
    });

    it("renders scaleLine exist", async () => {
        const wrapper = shallowMount(PortalFooterComponent, {
            store,
            computed: {
                footerConfig: () => sinon.stub(),
                masterPortalVersionNumber: () => sinon.stub(),
                mobile: () => sinon.stub()
            },
            localVue
        });

        await wrapper.vm.$nextTick();
        expect(wrapper.find("scaleline-stub").exists()).to.be.true;
        expect(wrapper.find("scaleline-stub").classes()).to.not.includes("footer-scaleLine");
    });

    it("does not render tool-link for not supported tools in 3D", async () => {
        // mock Radio.request("Tool", "getSupportedIn3d");
        sinon.stub(Radio, "request").returns([]);

        const wrapper = shallowMount(PortalFooterComponent, {
            store,
            computed: {
                footerConfig: () => sinon.stub(),
                masterPortalVersionNumber: () => sinon.stub(),
                mobile: () => false,
                is3D: () => true
            },
            localVue
        });
        let aTags = null;

        await wrapper.vm.$nextTick();
        aTags = wrapper.findAll("a");

        expect(aTags.length).to.be.equals(1);
        expect(aTags.at(0).exists()).to.be.true;
        expect(aTags.at(0).text()).to.equals("ABC");
    });

    it("does render tool-link for supported tools in 3D", async () => {
        // mock Radio.request("Tool", "getSupportedIn3d");
        sinon.stub(Radio, "request").returns(["SdpDownload"]);

        const wrapper = shallowMount(PortalFooterComponent, {
            store,
            computed: {
                footerConfig: () => sinon.stub(),
                masterPortalVersionNumber: () => sinon.stub(),
                mobile: () => false,
                is3D: () => true
            },
            localVue
        });
        let aTags = null;

        await wrapper.vm.$nextTick();
        aTags = wrapper.findAll("a");

        expect(aTags.length).to.be.equals(2);
        expect(aTags.at(0).exists()).to.be.true;
        expect(aTags.at(0).text()).to.equals("ABC");
        expect(aTags.at(1).exists()).to.be.true;
        expect(aTags.at(1).text()).to.equals("SDP Download");
    });

    it("renders the footerInfo in footer", async () => {
        const wrapper = shallowMount(PortalFooterComponent, {
            store,
            computed: {
                footerConfig: () => sinon.stub(),
                masterPortalVersionNumber: () => sinon.stub(),
                mobile: () => sinon.stub()
            },
            localVue
        });

        await wrapper.vm.$nextTick();

        expect(wrapper.find("#footerInfo").exists()).to.be.true;

    });
    it("does not render the arrow icon to toggle mobileFooterInfo if it is configured false", () => {
        store.commit("PortalFooter/setShowShortMenu", true);
        const wrapper = shallowMount(PortalFooterComponent, {
            store,
            computed: {
                footerConfig: () => sinon.stub(),
                masterPortalVersionNumber: () => sinon.stub(),
                mobile: () => true
            },
            localVue
        });

        expect(wrapper.find(".bi-chevron-down").exists()).to.be.false;
    });
    it("does render the arrow icon to toggle mobileFooterInfo if it is configured true", () => {
        store.commit("PortalFooter/setShowShortMenu", true);
        toggler = true;
        const wrapper = shallowMount(PortalFooterComponent, {
            store,
            computed: {
                footerConfig: () => sinon.stub(),
                masterPortalVersionNumber: () => sinon.stub(),
                mobile: () => true
            },
            localVue
        });


        expect(wrapper.find(".bi-chevron-down").exists()).to.be.true;
    });
    it("does not render the arrow icon to toggle mobileFooterInfo in desktop version", () => {
        store.commit("PortalFooter/setShowShortMenu", true);
        toggler = true;
        const wrapper = shallowMount(PortalFooterComponent, {
            store,
            computed: {
                footerConfig: () => sinon.stub(),
                masterPortalVersionNumber: () => sinon.stub(),
                mobile: () => false
            },
            localVue
        });

        expect(wrapper.find(".bi-chevron-down").exists()).to.be.false;
    });
});
