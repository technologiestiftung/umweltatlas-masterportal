<script>
import isObject from "../../../../utils/isObject";
import {translateKeyWithPlausibilityCheck} from "../../../../utils/translateKeyWithPlausibilityCheck.js";
import {getDefaultOperatorBySnippetType} from "../utils/getDefaultOperatorBySnippetType.js";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import customParseFormat from "dayjs/plugin/customParseFormat";
import SnippetInfo from "./SnippetInfo.vue";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat);

export default {
    name: "SnippetDate",
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
        disabled: {
            type: Boolean,
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
        format: {
            type: String,
            required: false,
            default: "YYYY-MM-DD"
        },
        filterId: {
            type: Number,
            required: false,
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
        title: {
            type: [String, Boolean],
            required: false,
            default: true
        },
        maxValue: {
            type: String,
            required: false,
            default: undefined
        },
        minValue: {
            type: String,
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
            type: String,
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
            internalFormat: "YYYY-MM-DD",
            isInitializing: true,
            isAdjusting: false,
            minimumValue: "",
            maximumValue: "",
            value: "",
            precheckedIsValid: false,
            translationKey: "snippetDate",
            operatorWhitelist: [
                "EQ",
                "GT",
                "GE",
                "LT",
                "LE"
            ]
        };
    },
    computed: {
        ariaLabelDate () {
            return this.$t("modules.tools.filter.ariaLabel.date", {param: this.attrName});
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
        inRangeValue: {
            get () {
                const momentMinimum = dayjs(this.minimumValue, this.internalFormat),
                    momentMaximum = dayjs(this.maximumValue, this.internalFormat),
                    momentValue = dayjs(this.value, this.internalFormat, true);

                if (!momentValue.isValid()) {
                    return "";
                }
                else if (momentValue.isSameOrAfter(momentMaximum)) {
                    return momentMaximum.format(this.internalFormat);
                }
                else if (momentValue.isSameOrBefore(momentMinimum)) {
                    return momentMinimum.format(this.internalFormat);
                }
                return momentValue.format(this.internalFormat);
            },
            set (value) {
                this.value = value;
            }
        },
        securedOperator () {
            if (!this.operatorWhitelist.includes(this.operator)) {
                return getDefaultOperatorBySnippetType("date");
            }
            return this.operator;
        }
    },
    watch: {
        value () {
            if (!this.isAdjusting && (!this.isInitializing || this.precheckedIsValid)) {
                this.emitCurrentRule(dayjs(this.inRangeValue, this.internalFormat).format(this.format), this.isInitializing);
            }
        },
        adjustment (adjusting) {
            if (!isObject(adjusting) || this.visible === false || this.isParent) {
                return;
            }

            if (adjusting?.start) {
                this.isAdjusting = true;
            }

            if (adjusting?.finish) {
                this.$nextTick(() => {
                    this.isAdjusting = false;
                });
            }
        },
        disabled (value) {
            this.disable = typeof this.disabled === "boolean" ? value : true;
        }
    },
    mounted () {
        this.$nextTick(() => {
            const momentPrechecked = dayjs(this.prechecked, this.format, true),
                momentMin = dayjs(this.minValue, this.format, true),
                momentMax = dayjs(this.maxValue, this.format, true);

            this.precheckedIsValid = momentPrechecked.isValid();

            if (momentMin.isValid() && momentMax.isValid()) {
                this.minimumValue = momentMin.format(this.internalFormat);
                this.maximumValue = momentMax.format(this.internalFormat);

                if (this.precheckedIsValid) {
                    this.value = momentPrechecked.format(this.internalFormat);
                }
                this.$nextTick(() => {
                    this.isInitializing = false;
                    this.disable = false;
                    this.emitSnippetPrechecked(this.precheckedIsValid, this.snippetId, this.visible);
                });
            }
            else if (this.api) {
                this.api.getMinMax(this.attrName, minMaxObj => {
                    if (!isObject(minMaxObj)) {
                        return;
                    }

                    if (Object.prototype.hasOwnProperty.call(minMaxObj, "min")) {
                        this.minimumValue = dayjs(minMaxObj.min, this.format).format(this.internalFormat);
                    }
                    else {
                        this.minimumValue = momentMin.format(this.internalFormat);
                    }
                    if (Object.prototype.hasOwnProperty.call(minMaxObj, "max")) {
                        this.maximumValue = dayjs(minMaxObj.max, this.format).format(this.internalFormat);
                    }
                    else {
                        this.maximumValue = momentMax.format(this.internalFormat);
                    }

                    if (this.precheckedIsValid) {
                        this.value = momentPrechecked.format(this.internalFormat);
                    }
                    this.$nextTick(() => {
                        this.isInitializing = false;
                        this.disable = false;
                        this.emitSnippetPrechecked(this.precheckedIsValid, this.snippetId, this.visible);
                    });
                }, err => {
                    this.isInitializing = false;
                    this.disable = false;
                    this.emitSnippetPrechecked();
                    console.warn(err);
                }, typeof this.minValue === "undefined" && typeof this.maxValue !== "undefined", typeof this.minValue !== "undefined" && typeof this.maxValue === "undefined", true,
                {rules: this.fixedRules, filterId: this.filterId, format: this.format, commands: {
                    filterGeometry: this.filterGeometry,
                    geometryName: this.filterGeometryName
                }});
            }
            else {
                this.value = this.precheckedIsValid ? momentPrechecked.format(this.internalFormat) : "";
                this.$nextTick(() => {
                    this.isInitializing = false;
                    this.disable = false;
                    this.emitSnippetPrechecked(this.precheckedIsValid, this.snippetId, this.visible);
                });
            }
            if (this.visible && this.precheckedIsValid) {
                this.emitCurrentRule(this.prechecked, true);
            }
        });
    },
    methods: {
        translateKeyWithPlausibilityCheck,

        /**
         * Emits the setSnippetPrechecked event.
         * @param {Boolean} precheckedIsValid true if prechecked is valid.
         * @param {Number} snippetId The snippet id to emit.
         * @param {Boolean} visible true if the snippet is visible, false if not.
         * @returns {void}
         */
        emitSnippetPrechecked (precheckedIsValid, snippetId, visible) {
            this.$emit("setSnippetPrechecked", visible && precheckedIsValid ? snippetId : false);
        },
        /**
         * Emits the current rule to whoever is listening.
         * @param {*} value the value to put into the rule
         * @param {Boolean} [startup=false] true if the call comes on startup, false if a user actively changed a snippet
         * @returns {void}
         */
        emitCurrentRule (value, startup = false) {
            this.$emit("changeRule", {
                snippetId: this.snippetId,
                startup,
                fixed: !this.visible,
                attrName: this.attrName,
                operatorForAttrName: this.operatorForAttrName,
                operator: this.securedOperator,
                format: this.format,
                value
            });
        },
        /**
         * Emits the delete rule function to whoever is listening.
         * @returns {void}
         */
        deleteCurrentRule () {
            this.$emit("deleteRule", this.snippetId);
        },
        /**
         * Resets the values of this snippet.
         * @param {Function} onsuccess the function to call on success
         * @returns {void}
         */
        resetSnippet (onsuccess) {
            if (this.visible) {
                this.value = this.precheckedIsValid ?
                    dayjs(this.prechecked, this.format).format(this.internalFormat) : "";
            }
            this.$nextTick(() => {
                if (typeof onsuccess === "function") {
                    onsuccess();
                }
            });
        },
        /**
         * Triggered once when changes are made at the date picker to avoid set of rules during changes.
         * @returns {void}
         */
        startDateChange () {
            if (!isObject(this.adjustment)) {
                return;
            }
            this.isAdjusting = true;
        },
        /**
         * Triggered once when end of changes are detected at the date picker to start set of rules after changes.
         * @returns {void}
         */
        endDateChange () {
            if (!isObject(this.adjustment)) {
                return;
            }
            this.isAdjusting = false;
            this.$nextTick(() => {
                this.emitCurrentRule(dayjs(this.inRangeValue, this.internalFormat).format(this.format), this.isInitializing);
            });
        }
    }
};
</script>

<template>
    <div
        v-show="visible"
        class="snippetDateContainer"
    >
        <div
            v-if="info"
            class="right"
        >
            <SnippetInfo
                :info="info"
                :translation-key="translationKey"
            />
        </div>
        <div class="input-container">
            <label
                v-if="title !== false"
                class="snippetDateLabel left"
                :for="'snippetDate-' + snippetId"
            >{{ titleText }}</label>
            <input
                :id="'snippetDate-' + snippetId"
                v-model="inRangeValue"
                :aria-label="ariaLabelDate"
                class="snippetDate form-control"
                type="date"
                name="dateInput"
                :max="maximumValue"
                :min="minimumValue"
                :disabled="disable"
                @focus="startDateChange()"
                @blur="endDateChange()"
                @keyup.enter="endDateChange()"
            >
        </div>
    </div>
</template>

<style lang="scss" scoped>
    @import "~/css/mixins.scss";
    .form-control {
        height: 28px;
    }
    .snippetDateContainer {
        height: auto;
    }
    .snippetDateContainer input {
        clear: left;
        width: 100%;
        box-sizing: border-box;
        outline: 0;
        position: relative;
        margin-bottom: 5px;
        height: 34px;
    }
    .snippetDateContainer .left {
        float: left;
        width: 90%;
    }
    .snippetDateContainer .right {
        position: absolute;
        right: 0;
    }
    input[type="date"]::-webkit-calendar-picker-indicator {
        background: transparent;
        bottom: 0;
        color: transparent;
        cursor: pointer;
        height: auto;
        left: 0;
        position: absolute;
        right: 0;
        top: 0;
        width: auto;
    }
</style>
