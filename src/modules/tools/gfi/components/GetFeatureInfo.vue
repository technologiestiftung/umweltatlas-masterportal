<script>
import {mapGetters, mapMutations, mapActions} from "vuex";
import getters from "../store/gettersGfi";
import MobileTemplate from "./templates/MobileTemplate.vue";
import DetachedTemplate from "./templates/DetachedTemplate.vue";
import TableTemplate from "./templates/TableTemplate.vue";
import AttachedTemplate from "./templates/AttachedTemplate.vue";
import omit from "../../../../utils/omit";
import {mapAttributes} from "@masterportal/masterportalapi/src/lib/attributeMapper";
import api from "@masterportal/masterportalapi/src/maps/api";

export default {
    name: "GetFeatureInfo",
    components: {
        MobileTemplate,
        DetachedTemplate,
        TableTemplate,
        AttachedTemplate
    },
    data () {
        return {
            // current index of the pagination and so also for the feature in the gfiFeatures
            pagerIndex: 0,
            // key for re-render child(detached) component
            componentKey: false,
            updatedFeature: false
        };
    },
    computed: {
        // gfiWindow is deprecated
        ...mapGetters({
            isMobile: "mobile",
            gfiWindow: "gfiWindow",
            uiStyle: "uiStyle",
            ignoredKeys: "ignoredKeys"
        }),
        ...mapGetters("Tools/Gfi", Object.keys(getters)),
        ...mapGetters("Tools/Gfi", {
            gfiFeatures: "gfiFeaturesReverse"
        }),
        ...mapGetters("Maps", {
            mapSize: "size",
            mapMode: "mode"
        }),
        /**
         * Returns the current view type.
         * It only works if the string has the same name as the component (in ./templates).
         * @returns {String} the current view type (Detached or Mobile)
         */
        currentViewType: function () {
            // this.gfiWindow is deprecated
            if (this.gfiWindow) {
                console.warn("Parameter 'gfiWindow' is deprecated. Please use 'Portalconfig.menu.tool.gfi.desktopType' instead.");
            }

            if (this.isMobile) {
                return "MobileTemplate";
            }
            // this.gfiWindow is deprecated
            else if ((this.desktopType || this.gfiWindow)?.toLowerCase() === "attached") {
                return "AttachedTemplate";
            }
            else if (this.uiStyle === "TABLE") {
                return "TableTemplate";
            }
            return "DetachedTemplate";
        },
        /**
         * Is visible if there is at least one feature and the gfi is activated.
         * @returns {Boolean} gfi visibility
         */
        isVisible: function () {
            return this.gfiFeatures !== null && this.active;
        },
        /**
         * Returns the feature depending on the pager index.
         * @returns {?Object} - the current feature
         */
        feature: function () {
            if (this.gfiFeatures !== null && Array.isArray(this.gfiFeatures) && this.gfiFeatures.length > 0) {
                return this.gfiFeatures[this.pagerIndex];
            }
            return null;
        }
    },
    watch: {
        /**
         * Whenever active changes and it's false, reset function will call.
         * @param {Boolean} value Is gfi active.
         * @returns {void}
         */
        active: function (value) {
            this.handleMapListener(this.mapMode, value);
        },
        /**
         * Whenever the map mode changes  reset function will call.
         * @param {String} mode The map mode.
         * @returns {void}
         */
        mapMode: function (mode) {
            this.handleMapListener(mode, this.active);
        },
        /**
         * Whenever feature changes, put it into the store
         * @param {?Object} newValue - the current feature
         * @returns {void}
         */
        feature: function (newValue) {
            this.setCurrentFeature(newValue);
        },
        /**
         * Whenever mapSize changes, component key is changed
         * to force re-render detached component (key-changing).
         * @returns {void}
         */
        mapSize: function () {
            if (this.currentViewType === "Detached") {
                this.componentKey = !this.componentKey;
            }
        },
        /**
         * Whenever gfiFeatures changes, set pagerIndex to zero
         * and set the updateFeature value to true if feature are given.
         * @param {?Object} newValue - the current feature
         * @returns {void}
         */
        gfiFeatures: function (newValue) {
            this.pagerIndex = 0;
            this.setUpdatedFeature(Array.isArray(newValue) && newValue.length > 0);
        }
    },

    mounted () {
        this.handleMapListener(this.mapMode, this.active);
    },
    beforeUpdate () {
        this.createMappedProperties(this.feature);
    },
    methods: {
        ...mapActions("Maps", ["registerListener", "unregisterListener"]),
        ...mapActions("Tools/Gfi", ["updateClick", "highlight3DTile", "removeHighlight3DTile", "removeHighlightColor"]),
        ...mapMutations("Tools/Gfi", ["setGfiFeatures", "setCurrentFeature"]),
        /**
         * Resets means to set the gfiFeatures to null and revert 3D Coloring.
         * This closes the gfi window/modal/popover.
         * @returns {void}
         */
        reset: function () {
            this.setGfiFeatures(null);
            if (this.mapMode === "3D") {
                this.removeHighlightColor();
            }
        },
        /**
         * Set updatedFeature value.
         * @param {Boolean} val - false if features have been updated or no features are given
         * @returns {void}
         */
        setUpdatedFeature: function (val = false) {
            this.updatedFeature = val;
        },
        /**
         * Increases the index for the pagination.
         * @returns {void}
         */
        increasePagerIndex: function () {
            if (this.pagerIndex < this.gfiFeatures.length - 1) {
                this.pagerIndex += 1;
            }
        },
        /**
         * Decreases the index for the pagination.
         * @returns {void}
         */
        decreasePagerIndex: function () {
            if (this.pagerIndex > 0) {
                this.pagerIndex -= 1;
            }
        },
        createMappedProperties: function (feature) {
            if (Array.isArray(feature?.getFeatures())) {
                feature.getFeatures().forEach(singleFeature => {
                    this.createMappedProperties(singleFeature);
                });

            }
            else if (feature?.getProperties() && feature?.getProperties() !== null) {
                feature.getMappedProperties = () => this.prepareProperties(feature.getProperties(), feature.getAttributesToShow(), this.ignoredKeys);
            }
        },
        /**
         * Checks which properties should be displayed.
         * If all should be displayed, the ignoredKeys omitted.
         * Otherwise the properties are mapped
         * @param {Object} properties - the feature properties
         * @param {Object} mappingObject - "gfiAttributes" from the layer
         * @param {String[]} ignoredKeys - configured in the config.js
         * @returns {Object} prepared properties - mapped by MappingObject or omitted by ignoredKeys
         */
        prepareProperties: function (properties, mappingObject, ignoredKeys) {
            if (mappingObject === "showAll" && Array.isArray(ignoredKeys)) {
                return omit(properties, ignoredKeys, true);
            }
            return mapAttributes(properties, mappingObject);
        },

        /**
         * Handles the maps listener in 2D and 3D mode, when in relation to active.
         * @param {String} mapMode The map mode.
         * @param {Boolean} active Is gfi active.
         * @returns {void}
         */
        handleMapListener: function (mapMode, active) {
            if (active) {
                if (mapMode === "2D") {
                    this.registerListener({type: "click", listener: this.updateClick});
                    this.removeHighlight3DTile();
                }
                else if (mapMode === "3D") {
                    const map3D = mapCollection.getMap("3D");

                    if (this.coloredHighlighting3D && this.coloredHighlighting3D?.enabled !== false) {
                        this.highlight3DTile();
                    }
                    this.unregisterListener({type: "click", listener: this.updateClick});
                    api.map.olcsMap.handle3DEvents({scene: map3D.getCesiumScene(), map3D: map3D, callback: (clickObject) => this.updateClick(Object.freeze(clickObject))});
                }
            }
            else {
                if (mapMode === "3D") {
                    this.removeHighlight3DTile();
                }
                this.reset();
                this.unregisterListener({type: "click", listener: this.updateClick});
            }
        }
    }
};
</script>

<template>
    <div
        v-if="isVisible && feature !== null"
        class="gfi"
    >
        <component
            :is="currentViewType"
            :key="componentKey"
            :feature="feature"
            :is-updated="updatedFeature"
            @updateFeatureDone="setUpdatedFeature()"
            @close="reset"
        >
            <!-- Slot Content for Footer -->
            <template
                v-if="gfiFeatures.length > 1"
                #footer
            >
                <div class="gfi-footer">
                    <div
                        :class="[pagerIndex < 1 ? 'disabled' : '', 'pager-left', 'pager']"
                        role="button"
                        tabindex="0"
                        @click="decreasePagerIndex"
                        @keydown.enter="decreasePagerIndex"
                    >
                        <span class="bootstrap-icon">
                            <i class="bi-chevron-left" />
                        </span>
                    </div>
                    <div
                        :class="[pagerIndex === gfiFeatures.length - 1 ? 'disabled' : '', 'pager-right', 'pager']"
                        role="button"
                        tabindex="0"
                        @click="increasePagerIndex"
                        @keydown.enter="increasePagerIndex"
                    >
                        <span class="bootstrap-icon">
                            <i class="bi-chevron-right" />
                        </span>
                    </div>
                </div>
            </template>
        </component>
    </div>
</template>


<style lang="scss">
@import "~variables";

.gfi {
    color: $secondary_contrast;
}
.bold{
    font-weight: bold;
}
.gfi-footer {
        color: $dark_grey;
        font-size: $font_size_huge;
         .pager {
            background-color: $secondary;
            padding: 6px;
            cursor: pointer;
            width: 50%;
            margin: 0;
            text-align: center;
            list-style: none;
        }

        .pager-left {
            float: left;
            border-right: 1px solid $light_grey;
        }

        .pager-right {
            float: right;
        }
        .disabled {
            cursor: not-allowed;
            background-color: lighten($light_grey_inactive, 40%);
            color: $light_grey_inactive_contrast;
        }

    }

</style>
