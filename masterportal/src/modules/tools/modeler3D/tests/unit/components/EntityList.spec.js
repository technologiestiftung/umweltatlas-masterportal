import {expect} from "chai";
import sinon from "sinon";
import {mount, config, createLocalVue} from "@vue/test-utils";
import EntityListComponent from "../../../components/ui/EntityList.vue";

const localVue = createLocalVue();

config.mocks.$t = key => key;

describe("src/modules/tools/modeler3D/components/EntityList.vue", () => {
    let wrapper;

    afterEach(() => {
        sinon.restore();
        if (wrapper) {
            wrapper.destroy();
        }
    });

    it("shows buttons for importedModel", () => {
        wrapper = mount(EntityListComponent, {localVue, propsData: {
            objects: [{
                id: "id",
                name: "name",
                show: false
            }],
            objectsLabel: "Test",
            entity: true
        }});

        const zoomToButton = wrapper.find("#list-zoomTo"),
            editButton = wrapper.find("#list-edit"),
            hideButton = wrapper.find("#list-hide"),
            deleteButton = wrapper.find("#list-delete");

        expect(zoomToButton.exists()).to.be.true;
        expect(editButton.exists()).to.be.true;
        expect(hideButton.exists()).to.be.true;
        expect(deleteButton.exists()).to.be.true;
    });

    it("shows buttons for hiddenObjects", () => {
        wrapper = mount(EntityListComponent, {localVue, propsData: {
            objects: [{
                id: "id",
                name: "name",
                show: false
            }],
            objectsLabel: "Test",
            entity: true
        }});

        const hideButton = wrapper.find("#list-hide");

        expect(hideButton.exists()).to.be.true;
    });
});
