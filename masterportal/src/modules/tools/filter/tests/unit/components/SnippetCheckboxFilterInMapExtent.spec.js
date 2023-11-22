import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import SnippetCheckboxFilterInMapExtentComponent from "../../../components/SnippetCheckboxFilterInMapExtent.vue";
import {expect} from "chai";

const localVue = createLocalVue();

localVue.use(Vuex);

config.mocks.$t = key => key;

describe("src/modules/tools/filter/components/SnippetCheckboxFilterInMapExtent.vue", () => {
    let wrapper;

    beforeEach(() => {
        wrapper = shallowMount(SnippetCheckboxFilterInMapExtentComponent, {
            propsData: {
                filterId: 1
            },
            localVue
        });
    });

    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
    });

    it("should render correctly", () => {
        expect(wrapper.find("input").classes("snippetCheckbox")).to.be.true;
        expect(wrapper.find(".snippetCheckbox").element.checked).to.be.equal(false);
    });

    it("should emit the correct function after click on the checkbox", async () => {
        const checkbox = wrapper.find(".snippetCheckbox");

        checkbox.trigger("click");
        await wrapper.vm.$nextTick();
        expect(wrapper.emitted()).to.have.property("commandChanged");
    });
    it("should render SnippetInfo if info text is given", async () => {
        await wrapper.setData({
            info: "Test"
        });
        expect(wrapper.find(".right").exists()).to.be.true;
    });
    it("should not render SnippetInfo if info is false", async () => {
        await wrapper.setData({
            info: false
        });
        expect(wrapper.find(".right").exists()).to.be.false;
    });
});
