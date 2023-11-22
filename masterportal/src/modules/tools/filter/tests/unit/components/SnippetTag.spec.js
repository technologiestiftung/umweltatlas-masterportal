import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import SnippetTag from "../../../components/SnippetTag.vue";
import {expect} from "chai";

const localVue = createLocalVue();

config.mocks.$t = key => key;

describe("src/modules/tools/generalFilter/components/SnippetTag.vue", () => {
    describe("constructor", () => {
        it("should have correct default values", () => {
            const wrapper = shallowMount(SnippetTag, {localVue});

            expect(wrapper.vm.isResetAll).to.be.false;
            expect(wrapper.vm.snippetId).to.equal(0);
            expect(wrapper.vm.value).to.equal("");
            wrapper.destroy();
        });
    });
    describe("removeTag", () => {
        it("should emit deleteAllRules", async () => {
            const wrapper = shallowMount(SnippetTag, {localVue}),
                buttonClick = wrapper.find(".btn-tags");

            await wrapper.setProps({isResetAll: true});

            buttonClick.trigger("click");

            expect(wrapper.emitted().resetAllSnippets).to.be.an("array").and.to.have.lengthOf(1);

            wrapper.destroy();
        });
    });
});
