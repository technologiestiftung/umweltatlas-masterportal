<script>
import IconButton from "./IconButton.vue";

/**
 * Shared component that provides buttons for two-level selection of geometries and symbols.
 * @module shared/modules/draw/DrawTypes
 * @vue-prop {Object} [circleOptions={innerRadius: 100, interactive: true, outerRadius: 500}] - The circle Options.
 * @vue-prop {Object} currentLayout - The current layout for the styling.
 * @vue-prop {Object} [currentLayoutOuterCircle={}] - The current layout for styling the outer circle. Only used for double circle.
 * @vue-prop {Object} [drawIcons={box: "bi-square", circle: "bi-circle", doubleCircle: "bi-record-circle", geometries: "bi-hexagon-fill", line: "bi-slash-lg", pen: "bi-pencil-fill", point: "bi-circle-fill", polygon: "bi-octagon", symbols: "bi-circle-square"}] - The icons for draw buttons.
 * @vue-prop {String[]} [drawTypes=["pen", "geometries", "symbols"]] - The drawing types.
 * @vue-prop {String} [selectedDrawType=""] - The selected draw type.
 * @vue-prop {String} [selectedDrawTypeMain=""] - The selected draw type main.
 * @vue-prop {Function} setSelectedDrawType - Setter for selected draw type.
 * @vue-prop {Function} [setSelectedDrawTypeMain=null] - Setter for selected draw type main.
 * @vue-prop {ol/source/Vector} source - The vector source for drawings.
 * @vue-data {ol/interaction/Draw} drawInteraction=null - The current draw interaction.
 */
export default {
    name: "DrawTypes",
    components: {
        IconButton
    },
    props: {
        circleOptions: {
            type: Object,
            default () {
                return {
                    innerRadius: 0,
                    interactive: true,
                    outerRadius: 0
                };
            }
        },
        currentLayout: {
            type: Object,
            required: true
        },
        currentLayoutOuterCircle: {
            type: Object,
            default () {
                return {};
            }
        },
        drawIcons: {
            type: Object,
            default () {
                return {
                    box: "bi-square",
                    circle: "bi-circle",
                    doubleCircle: "bi-record-circle",
                    geometries: "bi-hexagon-fill",
                    line: "bi-slash-lg",
                    pen: "bi-pencil-fill",
                    point: "bi-circle-fill",
                    polygon: "bi-octagon",
                    symbols: "bi-circle-square"
                };
            }
        },
        drawTypes: {
            type: Array,
            default () {
                return ["pen", "geometries", "symbols"];
            }
        },
        selectedDrawType: {
            type: String,
            default () {
                return "";
            }
        },
        selectedDrawTypeMain: {
            type: String,
            default () {
                return "";
            }
        },
        setSelectedDrawType: {
            type: Function,
            required: true
        },
        setSelectedDrawTypeMain: {
            type: Function,
            default () {
                return null;
            }
        }
    },
    methods: {
        /**
         * Regulate the interaction.
         * @param {String} drawType The current draw type.
         * @returns {void}
         */
        regulateInteraction (drawType) {
            if (typeof this.setSelectedDrawTypeMain === "function") {
                this.setSelectedDrawTypeMain(this.selectedDrawTypeMain !== drawType ? drawType : "");
            }

            this.$emit("stop-drawing");

            if (this.selectedDrawType !== drawType) {
                this.setSelectedDrawType(drawType);
            }

            this.$emit("start-drawing");
        }
    }
};
</script>

<template>
    <div class="d-flex mb-2 align-items-center">
        <IconButton
            v-for="drawType in drawTypes"
            :id="'draw-' + drawType"
            :key="drawType"
            :aria="$t('common:modules.tools.modeler3D.draw.geometries.' + drawType)"
            :class-array="[
                'btn-primary',
                'me-3',
                selectedDrawType === drawType || selectedDrawTypeMain === drawType ? 'active': ''
            ]"
            :interaction="() => regulateInteraction(drawType)"
            :icon="drawIcons[drawType]"
        />
    </div>
</template>
