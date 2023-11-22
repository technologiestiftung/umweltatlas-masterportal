<script>
import * as constantsRouting from "../store/constantsRouting";
import {mapState} from "vuex";
export default {
    name: "RoutingAvoidFeatures",
    props: {
        activeAvoidFeaturesOptions: {
            type: Array,
            required: true
        },
        settings: {
            type: Object,
            required: true
        },
        disabled: {
            type: Boolean,
            required: false
        }
    },
    data () {
        return {
            showAvoidFeatures: false,
            avoidFeaturesFromConfig: undefined,
            avoidSpeedProfileOptionsConstants: constantsRouting.avoidSpeedProfileOptions
        };
    },
    computed: {
        ...mapState([
            "configJson"
        ]),
        /**
         * Computed value for the options to display with the current active speed profile
         * @returns {Object[]} settings
         */
        avoidSpeedProfileOptions ({settings}) {
            return this.avoidSpeedProfileOptionsConstants?.filter(
                (option) => option.availableProfiles?.includes(settings.speedProfile)
            );
        }
    },
    created () {
        this.avoidFeaturesFromConfig = this.configJson.Portalconfig.menu.tools.children.routing?.directionsSettings?.customAvoidFeatures;
        if (this.avoidFeaturesFromConfig) {
            this.syncAvoidFeatures(this.avoidFeaturesFromConfig);
        }
    },
    methods: {
        /**
         * Updates the avoidSpeedProfileOptions
         * @param {Object} avoidFeaturesFromConfig The configured avoidFeatures
          * @returns {void}
         */
        syncAvoidFeatures (avoidFeaturesFromConfig) {
            for (const key in avoidFeaturesFromConfig) {
                this.removeDefaultSetting(key);
                for (const i in avoidFeaturesFromConfig[key]) {
                    this.updateAvoidSpeedProfileOptions(avoidFeaturesFromConfig[key][i], key);
                }
            }
        },
        /**
         * Removes the configured speedProfile from the default setting
         * @param {String} speedProfile The Speed Profile
         * @returns {Boolean} true if option is checked
         */
        removeDefaultSetting (speedProfile) {
            const avoidSpeedProfileOptions = this.avoidSpeedProfileOptionsConstants;

            for (const i in avoidSpeedProfileOptions) {
                if (this.avoidSpeedProfileOptionsConstants[i].availableProfiles.includes(speedProfile)) {
                    const index = this.avoidSpeedProfileOptionsConstants[i].availableProfiles.indexOf(speedProfile);

                    this.avoidSpeedProfileOptionsConstants[i].availableProfiles.splice(index, 1);
                }
            }
        },

        /**
         * Checks and updates the avoidSpeedProfileOptions
         * @param {String} avoidFeature to add
         * @param {String} speedProfile Related speedProfile to the avoidFeature
         * @returns {void}
         */
        updateAvoidSpeedProfileOptions (avoidFeature, speedProfile) {
            const avoidSpeedProfileOptions = this.avoidSpeedProfileOptionsConstants;
            let avoidFeatureExists = false;

            for (const i in avoidSpeedProfileOptions) {

                if (avoidSpeedProfileOptions[i].id === avoidFeature) {
                    if (!avoidSpeedProfileOptions[i].availableProfiles.includes(speedProfile)) {
                        avoidSpeedProfileOptions[i].availableProfiles.push(speedProfile);
                        avoidFeatureExists = true;
                    }
                }
            }
            if (avoidFeatureExists === false) {
                avoidSpeedProfileOptions.push({"id": avoidFeature, "availableProfiles": [speedProfile]});
            }
        },
        /**
         * Checks if the option is checked
         * @param {String} option to check
         * @returns {Boolean} true if option is checked
         */
        getIsRoutingAvoidFeaturesOptionsChecked (option) {
            return this.activeAvoidFeaturesOptions?.includes(option.id);
        },
        /**
         * Emits an event on user input
         * @param {String} option to change
         * @param {Boolean} checked to set
         * @returns {void}
         */
        setRoutingAvoidFeaturesOptions (option, checked) {
            if (checked) {
                this.$emit("addAvoidOption", option.id);
            }
            else {
                this.$emit("removeAvoidOption", option.id);
            }
        }
    }

};
</script>

<template>
    <div
        id="routing-avoid-features"
        class="d-flex flex-column"
    >
        <b
            class="pointer"
            role="button"
            tabindex="0"
            @click="showAvoidFeatures = !showAvoidFeatures"
            @keydown.enter="showAvoidFeatures = !showAvoidFeatures"
        >
            <span
                v-if="showAvoidFeatures"
                class="pointer bootstrap-icon"
            >
                <i class="bi-chevron-down" />
            </span>
            <span
                v-else
                class="pointer bootstrap-icon"
            >
                <i class="bi-chevron-right" />
            </span>
            {{ $t('common:modules.tools.routing.avoidOptions.header') }}
        </b>
        <div
            v-if="showAvoidFeatures"
            id="routing-avoid-features-options"
            class="d-flex flex-column ms-3"
        >
            <label
                v-for="option in avoidSpeedProfileOptions"
                :key="option.id"
                class="pointer"
            >
                <input
                    :id="'routing-avoid-features-option-input-' + option.id"
                    type="checkbox"
                    :value="option.id"
                    :checked="getIsRoutingAvoidFeaturesOptionsChecked(option)"
                    :disabled="disabled"
                    @change="setRoutingAvoidFeaturesOptions(option, $event.target.checked)"
                >
                <span class="ms-2">{{ $t('common:modules.tools.routing.avoidOptions.' + option.id) }}</span>
            </label>
        </div>
    </div>
</template>

<style scoped>

.d-flex {
    display: flex;
}
.flex-column {
    flex-direction: column;
}

.pointer {
    cursor: pointer;
}
</style>
