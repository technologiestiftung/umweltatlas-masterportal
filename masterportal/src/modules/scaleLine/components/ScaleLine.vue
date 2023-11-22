<script>
import {mapGetters} from "vuex";

export default {
    name: "ScaleLine",
    computed: {
        ...mapGetters("Maps", ["scaleToOne", "scaleWithUnit", "mode", "getView"]),
        ...mapGetters(["mobile", "scaleLineConfig"]),
        ...mapGetters("Tools/ScaleSwitcher", ["isDisplayInFooter"]),
        showScale () {
            return this.scaleLineConfig && !this.mobile && this.mode === "2D";
        },
        /**
         * The current Map scale
         */
        scale: {
            get () {
                return this.$store.state.Maps.scale;
            },
            set (value) {
                this.$store.commit("Maps/setScale", value);
            }
        },
        // All available scales for select
        scales: {
            get () {
                return this.getView.get("options").map(option => option.scale);
            }
        },
        // Flag if scale select should be shown
        showScaleAsSelect: {
            get () {
                return this.showScale && this.isDisplayInFooter;
            }
        }
    },
    methods: {
        /**
         * Sets the resolution
         * @param {Number} index - index of selected scale
         * @returns {void}
         */
        setResolutionByIndex (index) {
            const view = this.getView;

            view.setResolution(view.getResolutions()[index]);
        }
    }

};
</script>

<template>
    <div
        v-if="showScale"
        id="scales"
        class="d-flex"
        :title="$t('modules.footer.scale')"
    >
        <div
            v-if="showScaleAsSelect"
            class="d-flex"
        >
            <label
                class="select-label m-d-2"
                for="scale-as-select"
            >{{ $t("modules.tools.scaleSwitcher.label") }}</label>
            <select
                id="scale-as-select"
                v-model="scale"
                class="select-input form-select-sm"
                @change="setResolutionByIndex($event.target.selectedIndex)"
            >
                <option
                    v-for="(scaleValue, i) in scales"
                    :key="i"
                    :value="scaleValue"
                >
                    1 : {{ scaleValue }}
                </option>
            </select>
        </div>
        <span
            v-else
            class="scale-as-a-ratio"
        >
            {{ scaleToOne }}
        </span>
        <span class="scale-line">
            {{ scaleWithUnit }}
        </span>
    </div>
</template>

<style lang="scss">
    @import "~variables";

    #scales {
        background: fade($secondary, 90%);
        color: $secondary_contrast;
        text-align: center;
        font-size: $font-size-sm;

        .scale-line {
            color: lighten($secondary_contrast, 10%);
            border-bottom: 1px solid;
            border-left: 1px solid;
            border-right: 1px solid;
            display: inline-block;
            width: 2cm;
        }

        .scale-as-a-ratio {
            padding: 0 16px;
            color: $dark_grey;
        }

        .select-input {
            padding-block: 0;
            margin-inline: 10px;
            color: lighten($secondary_contrast, 10%);
            background-color: $secondary;
            border: 1px solid #81818d;
            border-radius: 2px;
        }
    }
</style>
