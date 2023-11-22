import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import BasicFileImportComponent from "../../components/BasicFileImport.vue";
import {expect} from "chai";

const localVue = createLocalVue();

localVue.use(Vuex);

config.mocks.$t = key => key;

describe("src/share-components/fileImport/components/BasicFileImport.vue", () => {
    let store, wrapper;

    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
    });

    it("renders the fileImport", () => {
        wrapper = shallowMount(BasicFileImportComponent, {store, localVue});

        expect(wrapper.find("#basic-file-import").exists()).to.be.true;
    });

    it("sets focus to first input control", async () => {
        const elem = document.createElement("div");

        if (document.body) {
            document.body.appendChild(elem);
        }

        wrapper = shallowMount(BasicFileImportComponent, {store, localVue, attachTo: elem});
        wrapper.vm.setFocusToFirstControl();
        await wrapper.vm.$nextTick();
        expect(wrapper.find(".upload-button-wrapper").element).to.equal(document.activeElement);
    });
});
