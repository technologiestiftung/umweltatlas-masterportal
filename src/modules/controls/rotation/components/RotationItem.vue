<script>
import {mapGetters} from "vuex";
import ControlIcon from "../../ControlIcon.vue";
import TableStyleControl from "../../TableStyleControl.vue";

export default {
    name: "RotationItem",
    components: {
        ControlIcon
    },
    data () {
        return {
            rotation: 0,
            showAlways: false
        };
    },
    computed: {
        ...mapGetters(["uiStyle", "controlsConfig"]),

        component () {
            return this.uiStyle === "TABLE" ? TableStyleControl : ControlIcon;
        }
    },
    mounted () {
        if (this.controlsConfig?.rotation.showAlways) {
            this.showAlways = this.controlsConfig.rotation.showAlways;
        }
        this.$nextTick(() => {
            mapCollection.getMapView("2D").on("change:rotation", this.updateRotation);
        });
    },
    methods: {
        /**
         * Updates the rotation of the control icon.
         * @param {Event} event the mapView rotation event.
         * @returns {void}
         */
        updateRotation (event) {
            this.rotation = event.target.getRotation();
            if (this.$el.querySelector && this.$el.querySelector("i")) {
                this.$el.querySelector("i").style.transform = `translate(-50%, -50%) rotate(${this.rotation}rad)`;
            }
        },

        /**
         * Set the mapView to north.
         * @returns {void}
         */
        setToNorth () {
            mapCollection.getMapView("2D").setRotation(0);
        }
    }
};
</script>

<template>
    <div
        v-if="rotation !== 0 || showAlways"
        id="rotation-control"
    >
        <component
            :is="component"
            ref="iconControl"
            icon-name="arrow-up-circle"
            :class="[component ? 'control' : 'Table']"
            title="Rotation"
            :disabled="false"
            :on-click="setToNorth"
        />
    </div>
</template>

<style lang="scss" scoped>
</style>
