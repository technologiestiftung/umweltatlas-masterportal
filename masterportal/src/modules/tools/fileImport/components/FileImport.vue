<script>
import ToolTemplate from "../../ToolTemplate.vue";
import BasicFileImport from "../../../../share-components/fileImport/components/BasicFileImport.vue";
import {getComponent} from "../../../../utils/getComponent";
import {mapActions, mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersFileImport";
import mutations from "../store/mutationsFileImport";
import isObject from "../../../../utils/isObject";
import store from "../../../../app-store";

export default {
    name: "FileImport",
    components: {
        ToolTemplate,
        BasicFileImport
    },
    data () {
        return {
            storePath: this.$store.state.Tools.FileImport
        };
    },
    computed: {
        ...mapGetters("Tools/FileImport", Object.keys(getters)),
        selectedFiletype: {
            get () {
                return this.storePath.selectedFiletype;
            },
            set (value) {
                this.setSelectedFiletype(value);
            }
        },

        dropZoneAdditionalClass: function () {
            return this.dzIsDropHovering ? "dzReady" : "";
        }
    },
    watch: {
        /**
         * Listens to the active property change.
         * @param {Boolean} isActive Value deciding whether the tool gets activated or deactivated.
         * @returns {void}
         */
        active (isActive) {
            if (isActive) {
                this.modifyImportedFileNames(this.importedFileNames);
                this.modifyImportedFileExtent(this.featureExtents, this.importedFileNames);
            }
        }
    },
    created () {
        this.$on("close", this.close);
    },
    methods: {
        ...mapActions("Tools/FileImport", [
            "importKML",
            "importGeoJSON",
            "setSelectedFiletype"
        ]),
        ...mapActions("Maps", ["addNewLayerIfNotExists", "zoomToExtent"]),
        ...mapMutations("Tools/FileImport", Object.keys(mutations)),

        addFile (files) {
            Array.from(files).forEach(file => {
                if (this.importedFileNames.includes(file)) {
                    return;
                }
                const reader = new FileReader();

                reader.onload = async f => {
                    const vectorLayer = await store.dispatch("Maps/addNewLayerIfNotExists", {layerName: "importDrawLayer"}, {root: true}),
                        fileNameSplit = file.name.split("."),
                        fileExtension = fileNameSplit.length > 0 ? fileNameSplit[fileNameSplit.length - 1].toLowerCase() : "";

                    if (fileExtension === "geojson" || fileExtension === "json") {
                        this.importGeoJSON({raw: f.target.result, layer: vectorLayer, filename: file.name});
                    }
                    else {
                        this.importKML({raw: f.target.result, layer: vectorLayer, filename: file.name});
                    }

                    this.setLayer(vectorLayer);
                };

                reader.readAsText(file);
            });
        },
        close () {
            this.setActive(false);
            const model = getComponent(this.id);

            if (model) {
                model.set("isActive", false);
            }
        },
        /**
         * opens the draw tool, closes fileImport
         * @pre fileImport is opened
         * @post fileImport is closed, the draw tool is opened
         * @fires Core.ModelList#RadioRequestModelListGetModelByAttributes
         * @returns {void}
         */
        openDrawTool () {
            // todo: to select the correct tool in the menu, for now Radio request is used
            const drawToolModel = Radio.request("ModelList", "getModelByAttributes", {id: "draw"});

            // todo: change menu highlighting - this will also close the current tool:
            drawToolModel.collection.setActiveToolsToFalse(drawToolModel);
            drawToolModel.setIsActive(true);

            this.close();
            this.$store.dispatch("Tools/Draw/toggleInteraction", "modify");
            this.$store.dispatch("Tools/setToolActive", {id: "draw", active: true});
        },
        /**
         * Zoom to the feature of imported file
         * @param {String} fileName the file name
         * @returns {void}
         */
        zoomTo (fileName) {
            if (!isObject(this.featureExtents) || !Object.prototype.hasOwnProperty.call(this.featureExtents, fileName)) {
                return;
            }

            this.zoomToExtent({extent: this.featureExtents[fileName]});
        },
        /**
         * Check if there are still features from the imported file.
         * If there are no features existed from the same imported file, the file name will be removed.
         * @param {String[]} fileNames the imported file name lists
         * @returns {void}
         */
        modifyImportedFileNames (fileNames) {
            const modifiedFileNames = [];

            if (typeof this.layer !== "undefined" && Array.isArray(fileNames) && fileNames.length) {
                fileNames.forEach(name => {
                    this.layer.getSource().getFeatures().forEach(feature => {
                        if (feature.get("source") && feature.get("source") === name && !modifiedFileNames.includes(name)) {
                            modifiedFileNames.push(name);
                        }
                    });
                });

                this.setImportedFileNames(modifiedFileNames);
            }
        },
        /**
         * Check if there are still features from the imported file.
         * If there are no features existed from the same imported file, the file name will be removed.
         * @param {Object} featureExtents the feature extent object, key is the file name and value is the feature extent
         * @param {String[]} fileNames the imported file name lists
         * @returns {void}
         */
        modifyImportedFileExtent (featureExtents, fileNames) {
            const modifiedFeatureExtents = {};

            fileNames.forEach(name => {
                modifiedFeatureExtents[name] = featureExtents[name];
            });

            this.setFeatureExtents(modifiedFeatureExtents);
        }
    }
};
</script>

<template lang="html">
    <ToolTemplate
        :title="$t(name)"
        :icon="icon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivate-gfi="deactivateGFI"
        :initial-width="300"
    >
        <template #toolBody>
            <div
                v-if="active"
                id="tool-file-import"
            >
                <BasicFileImport
                    :intro-formats="$t('modules.tools.fileImport.captions.introFormats')"
                    @add-file="addFile"
                >
                    <p
                        class="cta"
                        v-html="$t('share-components.import.introInfo')"
                    />
                </BasicFileImport>

                <div v-if="importedFileNames.length > 0">
                    <div class="h-seperator" />
                    <p class="cta">
                        <label
                            class="successfullyImportedLabel"
                            for="succesfully-imported-files"
                        >
                            {{ $t("modules.tools.fileImport.successfullyImportedLabel") }}
                        </label>
                        <ul id="succesfully-imported-files">
                            <li
                                v-for="(filename, index) in importedFileNames"
                                :key="index"
                                :class="enableZoomToExtend ? 'hasZoom' : ''"
                            >
                                <span>
                                    {{ filename }}
                                </span>
                                <span
                                    v-if="enableZoomToExtend"
                                    class="upload-button-wrapper"
                                    :title="$t(`common:modules.tools.fileImport.fileZoom`, {filename: filename})"
                                    role="button"
                                    tabindex="0"
                                    @click="zoomTo(filename)"
                                    @keydown.enter="zoomTo(filename)"
                                >
                                    {{ $t("modules.tools.fileImport.zoom") }}
                                </span>
                            </li>
                        </ul>
                    </p>
                    <div class="h-seperator" />
                    <p
                        class="cta introDrawTool"
                        v-html="$t('modules.tools.fileImport.captions.introDrawTool')"
                    />
                    <div>
                        <label class="upload-button-wrapper">
                            <input
                                type="button"
                                @click="openDrawTool"
                            >
                            {{ $t("modules.tools.fileImport.captions.drawTool") }}
                        </label>
                    </div>
                </div>
            </div>
        </template>
    </ToolTemplate>
</template>

<style lang="scss" scoped>
    @import "~/css/mixins.scss";
    @import "~variables";

    .h-seperator {
        margin:12px 0 12px 0;
        border: 1px solid #DDDDDD;
    }

    .upload-button-wrapper {
        color: $white;
        background-color: $secondary_focus;
        display: block;
        text-align:center;
        padding: 8px 12px;
        cursor: pointer;
        margin:12px 0 0 0;
        font-size: $font_size_big;
        &:focus {
            @include primary_action_focus;
        }
        &:hover {
            @include primary_action_hover;
        }
    }

    .cta {
        margin-bottom:12px;
    }

    .successfullyImportedLabel {
        font-weight: bold;
    }

    .introDrawTool {
        font-style: italic;
    }

    li {
        &.hasZoom {
            display: inline-block;
            width: 100%;
            &:not(:last-child) {
                margin-bottom: 5px;
            }
            span {
                &:first-child {
                    float: left;
                    margin-top: 5px;
                    width: calc(100% - 80px);
                }
                &:last-child {
                    float: right;
                    margin-top: 0;
                }
            }
        }
    }
</style>
