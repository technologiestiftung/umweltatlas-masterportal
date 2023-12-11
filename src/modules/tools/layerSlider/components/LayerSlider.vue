<script>
import { mapGetters, mapMutations, mapActions } from "vuex";
import ToolTemplate from "../../ToolTemplate.vue";
import { getComponent } from "../../../../utils/getComponent";
import getters from "../store/gettersLayerSlider";
import mutations from "../store/mutationsLayerSlider";
import LayerSliderHandle from "./LayerSliderHandle.vue";
import LayerSliderPlayer from "./LayerSliderPlayer.vue";

export default {
    name: "LayerSlider",
    components: {
        ToolTemplate,
        LayerSliderHandle,
        LayerSliderPlayer,
    },
    computed: {
        ...mapGetters("Tools/LayerSlider", Object.keys(getters)),
    },
    watch: {
        active(isActive) {
            if (!isActive) {
                this.setWindowsInterval(null);
                this.resetActiveLayer();
            }
        },
    },
    created() {
        this.$on("close", this.close);
    },
    mounted() {
        this.checkIfAllLayersAvailable(this.layerIds);
        this.addIndexToLayerIds(this.layerIds);
    },
    methods: {
        ...mapMutations("Tools/LayerSlider", Object.keys(mutations)),
        ...mapActions("Tools/LayerSlider", [
            "addIndexToLayerIds",
            "checkIfAllLayersAvailable",
        ]),

        /**
         * Sets active to false.
         * @returns {void}
         */
        close() {
            this.setActive(false);
            // The value "isActive" of the Backbone model is also set to false to change the CSS class in the menu (menu/desktop/tool/view.toggleIsActiveClass)
            const model = getComponent(this.id);

            if (model) {
                model.set("isActive", false);
            }
        },
    },
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
    >
        <template #toolBody>
            <div v-if="active" id="tool-layer-slider">
                <h4>
                    {{ $t(title) }}
                </h4>

                <p class="color-green" style="margin-top: 15px">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        class="bi bi-exclamation-circle-fill"
                        viewBox="0 0 16 16"
                        style="margin-bottom: 3px"
                    >
                        <path
                            d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4m.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2"
                        />
                    </svg>
                    Bitte Beachten Sie, dass das Neurendern des
                    Kartenausschnitts beim Zoomen manchmal etwas länger dauern
                    kann
                </p>
                <LayerSliderPlayer v-if="sliderType === 'player'" />
                <LayerSliderHandle />
            </div>
        </template>
    </ToolTemplate>
</template>

<style lang="scss" scoped>
@import "~variables";

#tool-layer-slider {
    @include media-breakpoint-up(sm) {
        min-width: 350px;
    }
}
</style>

