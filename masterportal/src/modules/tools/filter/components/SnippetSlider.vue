<script>
import isObject from "../../../../utils/isObject";
import {translateKeyWithPlausibilityCheck} from "../../../../utils/translateKeyWithPlausibilityCheck.js";
import {getDefaultOperatorBySnippetType} from "../utils/getDefaultOperatorBySnippetType.js";
import SnippetInfo from "./SnippetInfo.vue";

export default {
    name: "SnippetSlider",
    components: {
        SnippetInfo
    },
    props: {
        api: {
            type: Object,
            required: false,
            default: null
        },
        attrName: {
            type: [String, Array],
            required: false,
            default: ""
        },
        adjustment: {
            type: [Object, Boolean],
            required: false,
            default: false
        },
        decimalPlaces: {
            type: Number,
            required: false,
            default: 0
        },
        disabled: {
            type: Boolean,
            required: false,
            default: false
        },
        filterId: {
            type: Number,
            requiered: false,
            default: 0
        },
        filterGeometry: {
            type: [Object, Boolean],
            required: false,
            default: false
        },
        filterGeometryName: {
            type: [String, Boolean],
            required: false,
            default: false
        },
        info: {
            type: [String, Boolean],
            required: false,
            default: false
        },
        isParent: {
            type: Boolean,
            required: false,
            default: false
        },
        title: {
            type: [String, Boolean],
            required: false,
            default: true
        },
        minValue: {
            type: Number,
            required: false,
            default: undefined
        },
        maxValue: {
            type: Number,
            required: false,
            default: undefined
        },
        operatorForAttrName: {
            type: String,
            required: false,
            default: "AND"
        },
        operator: {
            type: String,
            required: false,
            default: undefined
        },
        prechecked: {
            type: Number,
            required: false,
            default: undefined
        },
        fixedRules: {
            type: Array,
            required: false,
            default: () => {
                return [];
            }
        },
        timeoutInput: {
            type: Number,
            required: false,
            default: 1400
        },
        timeoutSlider: {
            type: Number,
            required: false,
            default: 800
        },
        snippetId: {
            type: Number,
            required: false,
            default: 0
        },
        visible: {
            type: Boolean,
            required: false,
            default: true
        }
    },
    data () {
        return {
            disable: true,
            isInitializing: true,
            isAdjusting: false,
            value: 0,
            translationKey: "snippetSlider",
            currentSliderMin: 0,
            currentSliderMax: 100,
            slider: 0,
            input: 0,
            operatorWhitelist: [
                "EQ",
                "GT",
                "LT",
                "GE",
                "LE"
            ]
        };
    },
    computed: {
        ariaLabelSlider () {
            return this.$t("modules.tools.filter.ariaLabel.slider", {param: this.attrName});
        },
        titleText () {
            if (this.title === true) {
                return this.attrName;
            }
            else if (typeof this.title === "string") {
                return this.translateKeyWithPlausibilityCheck(this.title, key => this.$t(key));
            }
            return "";
        },
        securedOperator () {
            if (!this.operatorWhitelist.includes(this.operator)) {
                return getDefaultOperatorBySnippetType("slider");
            }
            return this.operator;
        }
    },
    watch: {
        adjustment (adjusting) {
            if (!isObject(adjusting) || this.visible === false || this.isParent) {
                return;
            }

            if (adjusting.start) {
                this.setCurrentSource("adjust");
                this.setIsAdjusting(true);
                this.resetMemoryAdjustMinMax();
            }

            if (typeof adjusting.adjust?.min !== "undefined" && adjusting.adjust?.min !== false && (typeof this.getMemoryAdjustMin() === "undefined" || adjusting.adjust.min < this.getMemoryAdjustMin())) {
                this.setMemoryAdjustMin(adjusting.adjust.min);
            }
            if (typeof adjusting.adjust?.max !== "undefined" && adjusting.adjust?.max !== false && (typeof this.getMemoryAdjustMax() === "undefined" || adjusting.adjust.max > this.getMemoryAdjustMax())) {
                this.setMemoryAdjustMax(adjusting.adjust.max);
            }

            if (adjusting.finish) {
                if (!this.isSelfSnippetId(adjusting?.snippetId) || (this.isSelfSnippetId(adjusting?.snippetId) && !this.hasRuleSet)) {
                    if (typeof this.getMemoryAdjustMin() !== "undefined") {
                        this.currentSliderMin = this.getMemoryAdjustMin();
                    }
                    if (typeof this.getMemoryAdjustMax() !== "undefined") {
                        this.currentSliderMax = this.getMemoryAdjustMax();
                    }

                    if (!this.hasRuleSet || isNaN(this.slider) || this.slider < this.currentSliderMin) {
                        this.slider = this.currentSliderMin;
                        this.input = this.currentSliderMin;
                    }
                    if (this.slider > this.currentSliderMax) {
                        this.slider = this.currentSliderMax;
                        this.input = this.currentSliderMax;
                    }
                }

                this.$nextTick(() => {
                    this.setIsAdjusting(false);
                });
            }
        },
        slider (val) {
            const value = parseFloat(val);

            if (!this.isInitializing && !this.isAdjusting && !this.isCurrentSource("adjust")) {
                this.emitCurrentRule(value, this.isInitializing);
            }
            if (!this.isCurrentSource("input")) {
                this.setInput(value);
            }
        },
        input (val) {
            if (this.isCurrentSource("slider") || this.isCurrentSource("init")) {
                return;
            }
            const value = parseFloat(val);

            if (isNaN(value)) {
                return;
            }
            this.setInput(value);
        },
        disabled (value) {
            this.disable = typeof value === "boolean" ? value : true;
        }
    },
    created () {
        this.adjustMinMax = [];
        this.intvInputReaction = -1;
        this.intvEmitCurrentRule = -1;
        this.hasRuleSet = false;
        this.currentSource = "init";
        this.sliderMouseDown = false;
    },
    mounted () {
        this.$nextTick(() => {
            this.getInitialSliderMin(this.attrName, min => {
                this.getInitialSliderMax(this.attrName, max => {
                    this.initSlider(parseFloat(min), parseFloat(max));
                    this.$nextTick(() => {
                        if (this.isPrecheckedValid()) {
                            this.emitCurrentRule([
                                this.isPrecheckedHigherThanMin() ? this.prechecked[0] : this.currentSliderMin,
                                this.isPrecheckedLowerThanMax() ? this.prechecked[1] : this.currentSliderMax], true);
                            this.$emit("setSnippetPrechecked", this.visible ? this.snippetId : false);
                        }
                        else {
                            this.$emit("setSnippetPrechecked", false);
                        }
                        this.setIsInitializing(false);
                    });
                }, error => {
                    this.setIsInitializing(false);
                    this.$emit("setSnippetPrechecked", false);
                    console.error(error);
                });
            }, error => {
                this.setIsInitializing(false);
                this.$emit("setSnippetPrechecked", false);
                console.error(error);
            });
        });
    },
    methods: {
        translateKeyWithPlausibilityCheck,

        /**
         * Receives the initial min and max by props or api.
         * @param {String} attrName The attrName to get the value from.
         * @param {Function} onsuccess A function(min) to receive the min value with.
         * @param {Function} onerror A function(error) to call on error.
         * @returns {void}
         */
        getInitialSliderMin (attrName, onsuccess, onerror) {
            if (typeof this.minValue !== "undefined") {
                if (typeof onsuccess === "function") {
                    onsuccess(this.minValue);
                }
                return;
            }
            else if (typeof this.api?.getMinMax !== "function") {
                onsuccess(this.currentSliderMin);
                return;
            }
            this.api.getMinMax(
                attrName,
                minMaxObj => {
                    if (!isObject(minMaxObj)) {
                        return;
                    }
                    if (typeof onsuccess === "function") {
                        onsuccess(minMaxObj.min);
                    }
                },
                onerror,
                true,
                false,
                false,
                {rules: this.fixedRules, filterId: this.filterId, commands: {
                    filterGeometry: this.filterGeometry,
                    geometryName: this.filterGeometryName
                }}
            );
        },
        /**
         * Receives the initial min and max by props or api.
         * @param {String} attrName The attrName to get the value from.
         * @param {Function} onsuccess A function(min) to receive the min value with.
         * @param {Function} onerror A function(error) to call on error.
         * @returns {void}
         */
        getInitialSliderMax (attrName, onsuccess, onerror) {
            if (typeof this.maxValue !== "undefined") {
                if (typeof onsuccess === "function") {
                    onsuccess(this.maxValue);
                }
                return;
            }
            else if (typeof this.api?.getMinMax !== "function") {
                onsuccess(this.currentSliderMin);
                return;
            }
            this.api.getMinMax(
                attrName,
                minMaxObj => {
                    if (!isObject(minMaxObj)) {
                        return;
                    }
                    if (typeof onsuccess === "function") {
                        onsuccess(minMaxObj.max);
                    }
                },
                onerror,
                false,
                true,
                false,
                {rules: this.fixedRules, filterId: this.filterId, commands: {
                    filterGeometry: this.filterGeometry,
                    geometryName: this.filterGeometryName
                }}
            );
        },
        /**
         * Initializes the slider with the given min/max value.
         * @param {Number} min The min value.
         * @param {Number} max The max value.
         * @returns {void}
         */
        initSlider (min, max) {
            this.currentSliderMin = min;
            this.currentSliderMax = max;
            if (this.isPrecheckedValid()) {
                this.slider = this.isPrecheckedHigherThanMin() ? this.prechecked : this.currentSliderMin;
            }
            else {
                this.slider = this.currentSliderMin;
            }
        },
        /**
         * Sets the initializing flag.
         * @param {Boolean} value The flag to set.
         * @returns {void}
         */
        setIsInitializing (value) {
            this.isInitializing = value;
        },
        /**
         * Checks if the prechecked value is valid.
         * @returns {Boolean} true if the prechecked value is valid, false if not.
         */
        isPrecheckedValid () {
            return !isNaN(parseFloat(this.prechecked));
        },
        isPrecheckedHigherThanMin () {
            return this.prechecked >= this.currentSliderMin;
        },
        isPrecheckedLowerThanMax () {
            return this.prechecked[1] <= this.currentSliderMax;
        },
        /**
         * Emits the setSnippetPrechecked event.
         * @param {Number} prechecked The prechecked values.
         * @param {Number} snippetId The snippet id to emit.
         * @param {Boolean} visible true if the snippet is visible, false if not.
         * @returns {void}
         */
        emitSnippetPrechecked (prechecked, snippetId, visible) {
            this.$emit("setSnippetPrechecked", visible && typeof prechecked !== "undefined" ? snippetId : false);
        },
        /**
         * Emits the current rule to whoever is listening.
         * @param {*} value the value to put into the rule
         * @param {Boolean} [startup=false] true if the call comes on startup, false if a user actively changed a snippet
         * @returns {void}
         */
        emitCurrentRule (value, startup = false) {
            if (!this.isCurrentSource("slider")) {
                this.changeRule(value, startup);
                this.$nextTick(() => {
                    this.$emit("enableFilterButton");
                });
                return;
            }
            this.$emit("disableFilterButton");
            this.setIntervalEmitCurrentRule(() => {
                if (!this.isSliderMouseDown()) {
                    this.changeRule(value, startup);
                    this.$emit("enableFilterButton");
                }
            }, this.timeoutSlider);
        },
        /**
         * Emits the current rule to whoever is listening.
         * @param {*} value the value to put into the rule
         * @param {Boolean} [startup=false] true if the call comes on startup, false if a user actively changed a snippet
         * @returns {void}
         */
        changeRule (value, startup) {
            this.setHasRuleSet(true);
            this.$emit("changeRule", {
                snippetId: this.snippetId,
                startup,
                fixed: !this.visible,
                attrName: this.attrName,
                operatorForAttrName: this.operatorForAttrName,
                operator: this.securedOperator,
                value
            });
        },
        /**
         * Emits the delete rule function to whoever is listening.
         * @returns {void}
         */
        deleteCurrentRule () {
            this.setHasRuleSet(false);
            this.$emit("deleteRule", this.snippetId);
        },
        /**
         * Resets the values of this snippet.
         * @param {Function} onsuccess the function to call on success
         * @returns {void}
         */
        resetSnippet (onsuccess) {
            this.setIsAdjusting(true);
            this.setCurrentSource("init");
            if (this.visible) {
                this.setHasRuleSet(false);
                this.slider = this.currentSliderMin;
            }
            this.$nextTick(() => {
                if (typeof onsuccess === "function") {
                    onsuccess();
                }
                this.setIsAdjusting(false);
            });
        },
        /**
         * Returns the steps the slider will make over the number range.
         * @param {Number} decimalPlaces the amount of decimal places
         * @returns {Number} the steps
         */
        getSliderSteps (decimalPlaces) {
            return 1 / Math.pow(10, decimalPlaces);
        },
        /**
         * Getting slider range error text in alerting box
         * @param {String} value the input value from input field
         * @returns {void}
         */
        getAlertRangeText (value) {
            if (value === undefined) {
                this.$store.dispatch("Alerting/addSingleAlert", i18next.t("common:snippets.slider.valueEmptyErrorMessage"));
            }
            else {
                this.$store.dispatch("Alerting/addSingleAlert", i18next.t("common:snippets.slider.valueOutOfRangeErrorMessage", {
                    inputValue: value,
                    minValueSlider: this.currentSliderMin,
                    maxValueSlider: this.currentSliderMax
                }));
            }
        },
        /**
         * Sets the adjusting flag.
         * @param {Boolean} value The adjusting flag.
         * @returns {void}
         */
        setIsAdjusting (value) {
            this.isAdjusting = value;
        },
        /**
         * Resets the memory of min and max value for a new round of adjustment.
         * @post The min and max value is set to an empty array.
         * @returns {void}
         */
        resetMemoryAdjustMinMax () {
            this.adjustMinMax = [];
        },
        /**
         * Returns the min value memorized during adjustment.
         * @returns {Number} The memorized min value.
         */
        getMemoryAdjustMin () {
            return this.adjustMinMax[0];
        },
        /**
         * Returns the max value memorized during adjustment.
         * @returns {Number} The memorized max value.
         */
        getMemoryAdjustMax () {
            return this.adjustMinMax[1];
        },
        /**
         * Memorizes the given min value during adjustment.
         * @param {Number} value The value to memorize.
         * @returns {void}
         */
        setMemoryAdjustMin (value) {
            this.adjustMinMax[0] = value;
        },
        /**
         * Memorizes the given max value during adjustment.
         * @param {Number} value The value to memorize.
         * @returns {void}
         */
        setMemoryAdjustMax (value) {
            this.adjustMinMax[1] = value;
        },
        /**
         * Returns true if the given snippetId equals - or if an array, holds - the own snippetId.
         * @param {Number|Number[]} snippetId The snippetId to check or an array of snippetIds to search through.
         * @returns {Boolean} true if this is the own snippetId or param contains the own snippetId, false if not.
         */
        isSelfSnippetId (snippetId) {
            if (Array.isArray(snippetId)) {
                return snippetId.some(id => id === this.snippetId);
            }
            return snippetId === this.snippetId;
        },
        /**
         * Sets flag if mouse is down on slider.
         * @returns {void}
         */
        setSliderMouseDown () {
            this.sliderMouseDown = true;
        },
        /**
         * Sets flag if mouse is up after down on slider.
         * @returns {void}
         */
        setSliderMouseUp () {
            this.sliderMouseDown = false;
            if (!this.isInitializing && !this.isAdjusting) {
                this.emitCurrentRule(parseFloat(this.slider));
            }
        },
        /**
         * Starts the interval to delay reaction after input and cancels the running interval.
         * @param {Function} callback The function to call once the timeout has passed.
         * @param {Number} timeout The timeout after which the callback should be called.
         * @post The interval has been set to be called once.
         * @returns {void}
         */
        setIntervalInputReaction (callback, timeout) {
            clearTimeout(this.intvInputReaction);
            this.intvInputReaction = setTimeout(() => {
                callback();
            }, timeout);
        },
        /**
         * Starts the interval to emit the current rule after a timeout and cancels the running interval.
         * @param {Function} callback The function to call once the timeout has passed.
         * @param {Number} timeout The timeout after which the callback should be called.
         * @post The interval has been set to be called once.
         * @returns {void}
         */
        setIntervalEmitCurrentRule (callback, timeout) {
            clearTimeout(this.intvEmitCurrentRule);
            this.intvEmitCurrentRule = setTimeout(() => {
                callback();
            }, timeout);
        },
        setInput (value) {
            if (this.isCurrentSource("slider") || this.isCurrentSource("init") || this.isCurrentSource("adjust")) {
                this.input = value;
                return;
            }
            this.$emit("disableFilterButton");
            this.setIntervalInputReaction(() => {
                this.slider = value;
            }, this.timeoutInput);
        },
        /**
         * Checks the current source of input ('init', 'slider' or 'input').
         * @param {String} value The value to check.
         * @returns {Boolean} true if the given value matches the currentSource, false if not.
         */
        isCurrentSource (value) {
            return this.currentSource === value;
        },
        /**
         * Sets the current source for input data.
         * @param {String} value The type of source 'init', 'slider' or 'input'.
         * @returns {void}
         */
        setCurrentSource (value) {
            this.currentSource = value;
        },
        /**
         * Sets the flag to indicate if a rule has been set by this slider.
         * @param {Boolean} value The flag to set.
         * @returns {void}
         */
        setHasRuleSet (value) {
            this.hasRuleSet = value;
        },
        /**
         * Checks if the give value isNaN.
         * @param {*} value The value.
         * @returns {Boolean} true if isNaN false if not.
         */
        checkNaN (value) {
            return isNaN(value);
        }
    }
};
</script>

<template>
    <div
        v-show="visible"
        class="snippetSliderContainer"
    >
        <div
            v-if="info"
            :class="title !== false ? 'right' : 'h-right'"
        >
            <SnippetInfo
                :info="info"
                :translation-key="translationKey"
            />
        </div>
        <label
            v-if="title !== false"
            :for="'snippetSlider-' + snippetId"
            class="snippetSliderLabel left"
        >{{ titleText }}</label>
        <input
            :id="'snippetSlider-' + snippetId"
            ref="inputNumber"
            v-model="input"
            :aria-label="ariaLabelSlider"
            class="input-single form-control"
            :step="getSliderSteps(decimalPlaces)"
            type="number"
            :min="currentSliderMin"
            :max="currentSliderMax"
            :name="title"
            :disabled="disabled"
            @input="setCurrentSource('input')"
        >
        <div class="slider-input-container">
            <input
                v-model="slider"
                class="slider-single"
                type="range"
                :class="disabled ? 'disabled':''"
                :step="getSliderSteps(decimalPlaces)"
                :disabled="disabled"
                :min="currentSliderMin"
                :max="currentSliderMax"
                @mousedown="setSliderMouseDown"
                @mouseup="setSliderMouseUp"
            >
        </div>
        <span class="min">{{ checkNaN(currentSliderMin) ? 0 : currentSliderMin }}</span>
        <span class="max">{{ checkNaN(currentSliderMax) ? 0 : currentSliderMax }}</span>
    </div>
</template>

<style lang="scss" scoped>
    @import "~/css/mixins.scss";
    @import "~variables";
    .form-control {
        height: 28px;
    }
    .snippetSliderContainer {
        height: auto;
    }
    .snippetSliderContainer input {
        clear: left;
        width: 100%;
        box-sizing: border-box;
        outline: 0;
        position: relative;
        margin-bottom: 5px;
    }
    .snippetSliderContainer .left {
        float: left;
        width: 90%;
    }
    .snippetSliderContainer .right {
        position: absolute;
        right: 0;
    }
    .snippetSliderContainer .h-right {
        min-height: 24px;
    }
    input[type="number"] {
        text-align: center;
        font-size: $font-size-base;
        -moz-appearance: textfield;
        width: 80px;
        float: right;
        margin-bottom: 10px;
        padding-top: 5px;
        margin-top: 2px;
    }

    input[type="range"]:active::-ms-thumb {
        background-color: $white;
        border: 1px solid $light_blue;
    }
    input[type="range"]:active::-moz-range-thumb {
        background-color: $white;
        border: 1px solid $light_blue;
    }
    input[type="range"]:active::-webkit-slider-thumb {
        background-color: $white;
        border: 1px solid $light_blue;
    }

    /* Firefox */
    input[type="range"] {
        -webkit-appearance: none;
        background-color: $light_grey;
        height: 15px;
        overflow: hidden;
        width: 100%;
        border-radius: 10px;
    }

    input[type="range"]::-webkit-slider-runnable-track {
        -webkit-appearance: none;
        height: 15px;
    }

    input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        background: $white;
        border-radius: 50%;
        box-shadow: -210px 0 0 200px $light_blue;
        cursor: pointer;
        height: 15px;
        width: 15px;
        border: 0;
    }

    input[type="range"]::-moz-range-thumb {
        background: $white;
        border-radius: 50%;
        box-shadow: -1010px 0 0 1000px $light_blue;
        cursor: pointer;
        height: 15px;
        width: 15px;
        border: 0;
    }

    input[type="range"]::-moz-range-track {
        background-color: $light_grey;
    }
    input[type="range"]::-moz-range-progress {
        background-color: $light_blue;
        height: 15px
    }
    input[type="range"]::-ms-fill-upper {
        background-color: $light_grey;
    }
    input[type="range"]::-ms-fill-lower {
        background-color: $light_blue;
    }
    span {
        &.min {
            float: left;
        }
        &.max {
            float: right;
        }
    }
    input[type="range"].disabled {
        -webkit-appearance: none;
        background-color: $dark_grey;
        height: 15px;
        overflow: hidden;
        width: 100%;
    }

    input[type="range"].disabled::-webkit-slider-thumb {
        -webkit-appearance: none;
        background: $light_grey;
        border-radius: 50%;
        box-shadow: -210px 0 0 200px $light_grey;
        cursor: pointer;
        height: 15px;
        width: 15px;
        border: 0;
    }

    input[type="range"].disabled::-moz-range-thumb {
        background: #ddd;
        border-radius: 50%;
        box-shadow: -1010px 0 0 1000px $dark_grey;
        cursor: pointer;
        height: 15px;
        width: 15px;
        border: 0;
    }
    input[type="range"].disabled::-moz-range-track {
        background-color: $dark_grey;
    }
    input[type="range"].disabled::-moz-range-progress {
        background-color: $dark_grey;
        height: 15px
    }
    input[type="range"].disabled::-ms-fill-upper {
        background-color: $dark_grey;
    }
    input[type="range"].disabled::-ms-fill-lower {
        background-color: $dark_grey;
    }
</style>
