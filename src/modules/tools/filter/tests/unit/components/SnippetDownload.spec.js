import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import SnippetDownload from "../../../components/SnippetDownload.vue";
import ExportButtonCSV from "../../../../../../share-components/exportButton/components/ExportButtonCSV.vue";
import ExportButtonGeoJSON from "../../../../../../share-components/exportButton/components/ExportButtonGeoJSON.vue";
import {expect} from "chai";
import sinon from "sinon";

const localVue = createLocalVue();

localVue.use(Vuex);

config.mocks.$t = key => key;

describe("src/modules/tools/filter/components/SnippetDownload.vue", () => {
    let wrapper = null;

    beforeEach(() => {
        wrapper = shallowMount(SnippetDownload, {
            propsData: {
                layerConfig: {
                    service: {
                        type: "something external"
                    }
                },
                layerId: "12345",
                filteredItems: [
                    {
                        a: "test ",
                        b: "test2 "
                    }
                ]
            },
            localVue
        });
        sinon.spy(wrapper.vm, "enableDownloadBtn");
        sinon.spy(wrapper.vm, "setDownloadSelectedFormat");
    });
    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
        sinon.restore();
    });

    describe("getDownloadHandler", () => {
        it("should hand over an empty array if filteredItems is anything but an array", () => {
            let last_result = false;
            const dummy = {
                handler: result => {
                    last_result = result;
                }
            };

            wrapper.vm.filteredItems = undefined;
            wrapper.vm.getDownloadHandler(dummy.handler);
            expect(last_result).to.be.an("array").that.is.empty;
        });
        it("should hand over an empty array if filteredItems is an array but has no objects in it", () => {
            let last_result = false;
            const dummy = {
                handler: result => {
                    last_result = result;
                }
            };

            wrapper.vm.filteredItems = [undefined, null, 1234, "string", true, false, []];
            wrapper.vm.getDownloadHandler(dummy.handler);
            expect(last_result).to.be.an("array").that.is.empty;
        });
        it("should hand over an empty array if filteredItems is an array with objects but without getProperties function", () => {
            let last_result = false;
            const dummy = {
                handler: result => {
                    last_result = result;
                }
            };

            wrapper.vm.filteredItems = [{
                notGetProperties: () => false
            }];
            wrapper.vm.getDownloadHandler(dummy.handler);
            expect(last_result).to.be.an("array").that.is.empty;
        });
        it("should hand over an array of properties", () => {
            let last_result = false;
            const dummy = {
                    handler: result => {
                        last_result = result;
                    }
                },
                expected = [
                    {a: 1, b: 2},
                    {a: 3, b: 4},
                    {a: 5, b: 6},
                    {a: 7, b: 8}
                ];

            wrapper.vm.filteredItems = [
                {getProperties: () => {
                    return {a: 1, b: 2};
                }},
                {getProperties: () => {
                    return {a: 3, b: 4};
                }},
                {getProperties: () => {
                    return {a: 5, b: 6};
                }},
                {getProperties: () => {
                    return {a: 7, b: 8};
                }}
            ];
            wrapper.vm.getDownloadHandler(dummy.handler);
            expect(last_result).to.deep.equal(expected);
        });
        it("should hand over an array of properties, excluding the geometry", () => {
            let last_result = false;
            const dummy = {
                    handler: result => {
                        last_result = result;
                    }
                },
                expected = [
                    {a: 1},
                    {a: 3},
                    {a: 5},
                    {a: 7}
                ];

            wrapper.vm.filteredItems = [
                {getProperties: () => {
                    return {a: 1, b: 2};
                }, getGeometryName: () => "b"},
                {getProperties: () => {
                    return {a: 3, b: 4};
                }, getGeometryName: () => "b"},
                {getProperties: () => {
                    return {a: 5, b: 6};
                }, getGeometryName: () => "b"},
                {getProperties: () => {
                    return {a: 7, b: 8};
                }, getGeometryName: () => "b"}
            ];
            wrapper.vm.getDownloadHandler(dummy.handler);
            expect(last_result).to.deep.equal(expected);
        });
    });
    describe("toggleShowDownload", async () => {
        it("should toggle showDownload", async () => {
            wrapper.vm.toggleShowDownload();
            expect(wrapper.vm.showDownload).to.equal(true);
            wrapper.vm.toggleShowDownload();
            expect(wrapper.vm.showDownload).to.equal(false);
        });
        it("should render download dropdowns if showDownload is true", async () => {
            const checkboxClick = wrapper.find("#tool-filter-download-box");

            checkboxClick.trigger("click");

            await wrapper.vm.$nextTick();

            expect(wrapper.find("#tool-filter-download-format").exists()).to.be.true;
            expect(wrapper.find("#tool-filter-download-filename").exists()).to.be.true;
        });
        it("should not render download dropdowns if showDownlad is false", async () => {
            const checkboxClick = wrapper.find("#tool-filter-download-box");

            checkboxClick.trigger("click");
            checkboxClick.trigger("click");

            await wrapper.vm.$nextTick();

            expect(wrapper.find("#tool-filter-download-format").exists()).to.be.false;
            expect(wrapper.find("#tool-filter-download-filename").exists()).to.be.false;
        });
    });
    describe("enableDownloadBtn", async () => {
        it("should set enableFileDownload true if format and filename are given", async () => {
            await wrapper.setData(
                {
                    filename: "name",
                    selectedFormat: "CSV"
                }
            );
            wrapper.vm.enableDownloadBtn();
            await wrapper.vm.$nextTick();
            expect(wrapper.vm.enableFileDownload).to.equal(true);
        });
        it("should set enableFileDownload false if format is not given", async () => {
            await wrapper.setData(
                {
                    filename: "name",
                    selectedFormat: ""
                }
            );
            wrapper.vm.enableDownloadBtn();
            await wrapper.vm.$nextTick();
            expect(wrapper.vm.enableFileDownload).to.equal(false);
        });
        it("should set enableFileDownload false if filename is not given", async () => {
            await wrapper.setData(
                {
                    filename: "",
                    selectedFormat: "CSV"
                }
            );
            wrapper.vm.enableDownloadBtn();
            await wrapper.vm.$nextTick();
            expect(wrapper.vm.enableFileDownload).to.equal(false);
        });
        it("should call enableDownloadBtn when a keyup event is fired", async () => {
            await wrapper.setData(
                {
                    showDownload: true
                }
            );
            const filenameInput = wrapper.find("#tool-filter-download-filename");

            filenameInput.trigger("keyup");

            await wrapper.vm.$nextTick();
            expect(wrapper.vm.enableDownloadBtn.calledOnce).to.be.true;
        });
    });
    describe("setDownloadSelectedFormat", () => {
        it("should call setDownloadSelectedFormat if option is selected", async () => {
            await wrapper.setData({
                formats: ["CSV", "GeoJSON"],
                showDownload: true
            });

            const options = wrapper.find("#tool-filter-download-format").findAll("option");

            await options.at(1).setSelected();

            expect(wrapper.find("option:checked").element.value).to.equal("CSV");
            expect(wrapper.vm.setDownloadSelectedFormat.calledOnce).to.be.true;
        });
        it("should set selectedFormat and call enableDowloadBtn", () => {
            wrapper.vm.setDownloadSelectedFormat("TestOption");
            expect(wrapper.vm.selectedFormat).is.equal("TestOption");
            expect(wrapper.vm.enableDownloadBtn.calledOnce).to.be.true;
        });
    });
    describe("enableFileDownload", async () => {
        it("should render ExportButtonCSV component", async () => {
            await wrapper.setData(
                {
                    showDownload: true,
                    selectedFormat: "CSV",
                    enableFileDownload: true
                }
            );
            await wrapper.vm.$nextTick();

            expect(wrapper.findComponent(ExportButtonCSV).exists()).to.be.true;
        });
        it("should render ExportButtonGeoJSON component", async () => {
            await wrapper.setData(
                {
                    showDownload: true,
                    selectedFormat: "GeoJSON",
                    enableFileDownload: true
                }
            );
            await wrapper.vm.$nextTick();

            expect(wrapper.findComponent(ExportButtonGeoJSON).exists()).to.be.true;
        });
    });
});
