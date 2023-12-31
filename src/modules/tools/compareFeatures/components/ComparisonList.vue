<script>
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersCompareFeatures";
import actions from "../store/actionsCompareFeatures";
import mutations from "../store/mutationsCompareFeatures";
import beautifyKey from "../../../../utils/beautifyKey.js";
import {isWebLink} from "../../../../utils/urlHelper.js";
import {isPhoneNumber, getPhoneNumberAsWebLink} from "../../../../utils/isPhoneNumber.js";
import {isEmailAddress} from "../../../../utils/isEmailAddress.js";
import toBold from "../../../../utils/toBold.js";

export default {
    name: "ComparisonList",
    props: {
        listOfFeatures: {
            type: Array,
            default: () => []
        },
        maxAttributesToShow: {
            type: Number,
            default: 12
        },
        enableMoreInfo: {
            type: Boolean,
            default: false
        },
        titleRemoveButton: {
            type: String,
            default: ""
        },
        layerSelection: {
            type: String,
            default: ""
        }
    },
    computed: {
        ...mapGetters("Tools/CompareFeatures", Object.keys(getters))
    },
    methods: {
        ...mapActions("Tools/CompareFeatures", Object.keys(actions)),
        ...mapMutations("Tools/CompareFeatures", Object.keys(mutations)),
        beautifyKey,
        isWebLink,
        isPhoneNumber,
        getPhoneNumberAsWebLink,
        isEmailAddress,
        toBold,
        removeVerticalBar (value) {
            return value.replaceAll("|", "<br>");
        }
    }
};
</script>

<template>
    <Component
        :is="'table'"
    >
        <table
            v-if="hasFeatures && !hasMultipleLayers"
            class="border"
        >
            <tbody>
                <tr
                    v-for="(column, index) in listOfFeatures"
                    :key="'tool-compareFeatures-' + index"
                >
                    <template
                        v-if="index < maxAttributesToShow && !enableMoreInfo"
                    >
                        <td
                            v-for="(value, key) in column"
                            :key="'tool-compareFeatures-td' + key"
                        >
                            <span
                                v-if="index === 0 && key !== 'col-1'"
                                class="close bootstrap-icon remove-feature"
                                type="button"
                                :title="$t('common:modules.tools.compareFeatures.removeFromList')"
                                role="button"
                                tabindex="0"
                                @click="removeFeatureFromPreparedList({features: listOfFeatures, featureId: key, selectedLayer: selectedLayer})"
                                @keydown.enter="removeFeatureFromPreparedList({features: listOfFeatures, featureId: key, selectedLayer: selectedLayer})"
                            >
                                <i class="bi-x-lg" />
                            </span>
                            <p v-if="isWebLink(value)">
                                <a
                                    :href="value"
                                    target="_blank"
                                >{{ value }}</a>
                            </p>
                            <p
                                v-else-if="value && value.toLowerCase() === 'true'"
                            >
                                <span>{{ $t('common:modules.tools.compareFeatures.trueFalse.true') }}</span>
                            </p>
                            <p
                                v-else-if="value && (value.toLowerCase() === 'false' || value.toLowerCase() === 'no')"
                            >
                                <span>{{ $t('common:modules.tools.compareFeatures.trueFalse.false') }}</span>
                            </p>
                            <p v-else-if="isPhoneNumber(value)">
                                <a :href="getPhoneNumberAsWebLink(value)">{{ value }}</a>
                            </p>
                            <p v-else-if="isEmailAddress(value)">
                                <a :href="`mailto:${value}`">{{ value }}</a>
                            </p>
                            <p
                                v-else-if="key === 'col-1' || index === 0"
                                class="bold"
                            >
                                {{ beautifyKey($t(value)) }}
                            </p>
                            <p
                                v-else-if="typeof value === 'string' && value.includes(';') && key.includes('SCHULEN')"
                            >
                                <span v-html="toBold(value, key)" />
                            </p>
                            <p
                                v-else-if="typeof value === 'string' && value.includes('|')"
                            >
                                <span v-html="removeVerticalBar(value)" />
                            </p>
                            <p
                                v-else-if="typeof value === 'string' && value.includes('<br>')"
                            >
                                <span v-html="value" />
                            </p>
                            <p v-else>
                                {{ value }}
                            </p>
                        </td>
                    </template>
                    <template v-if="enableMoreInfo">
                        <td
                            v-for="(value, key) in column"
                            :key="'tool-compareFeatures-td' + key"
                        >
                            <span
                                v-if="index === 0 && key !== 'col-1'"
                                class="close bootstrap-icon remove-feature"
                                type="button"
                                :title="$t('common:modules.tools.compareFeatures.removeFromList')"
                                role="button"
                                tabindex="0"
                                @click="removeFeatureFromPreparedList({features: listOfFeatures, featureId: key, selectedLayer: selectedLayer})"
                                @keydown.enter="removeFeatureFromPreparedList({features: listOfFeatures, featureId: key, selectedLayer: selectedLayer})"
                            >
                                <i class="bi-x-lg" />
                            </span>
                            <p v-if="isWebLink(value)">
                                <a
                                    :href="value"
                                    target="_blank"
                                >{{ value }}</a>
                            </p>
                            <p
                                v-else-if="value && value.toLowerCase() === 'true'"
                            >
                                <span>{{ $t('common:modules.tools.compareFeatures.trueFalse.true') }}</span>
                            </p>
                            <p
                                v-else-if="value && (value.toLowerCase() === 'false' || value.toLowerCase() === 'no')"
                            >
                                <span>{{ $t('common:modules.tools.compareFeatures.trueFalse.false') }}</span>
                            </p>
                            <p v-else-if="isPhoneNumber(value)">
                                <a :href="getPhoneNumberAsWebLink(value)">{{ value }}</a>
                            </p>
                            <p v-else-if="isEmailAddress(value)">
                                <a :href="`mailto:${value}`">{{ value }}</a>
                            </p>
                            <p
                                v-else-if="key === 'col-1' || index === 0"
                                class="bold"
                            >
                                {{ beautifyKey($t(value)) }}
                            </p>
                            <p
                                v-else-if="typeof value === 'string' && value.includes(';') && key.includes('SCHULEN')"
                            >
                                <span v-html="toBold(value, key)" />
                            </p>
                            <p
                                v-else-if="typeof value === 'string' && value.includes('|')"
                            >
                                <span v-html="removeVerticalBar(value)" />
                            </p>
                            <p
                                v-else-if="typeof value === 'string' && value.includes('<br>')"
                            >
                                <span v-html="value" />
                            </p>
                            <p v-else>
                                {{ value }}
                            </p>
                        </td>
                    </template>
                </tr>
            </tbody>
        </table>
        <table v-if="active && hasMultipleLayers">
            <tbody>
                <tr
                    v-for="(column, index) in listOfFeatures"
                    :key="'tool-compareFeatures-' + index"
                >
                    <template
                        v-if="index < maxAttributesToShow && !enableMoreInfo"
                    >
                        <td
                            v-for="(value, key) in column"
                            :key="'tool-compareFeatures-td' + key"
                        >
                            <span
                                v-if="index === 0 && key !== 'col-1'"
                                class="close bootstrap-icon remove-feature"
                                type="button"
                                :title="$t('common:modules.tools.compareFeatures.removeFromList')"
                                role="button"
                                tabindex="0"
                                @click="removeFeatureFromPreparedList({features: listOfFeatures, featureId: key, selectedLayer: selectedLayer})"
                                @keydown.enter="removeFeatureFromPreparedList({features: listOfFeatures, featureId: key, selectedLayer: selectedLayer})"
                            >
                                <i class="bi-x-lg" />
                            </span>
                            <p v-if="isWebLink(value)">
                                <a
                                    :href="value"
                                    target="_blank"
                                >{{ value }}</a>
                            </p>
                            <p
                                v-else-if="value && value.toLowerCase() === 'true'"
                            >
                                <span>{{ $t('common:modules.tools.compareFeatures.trueFalse.true') }}</span>
                            </p>
                            <p
                                v-else-if="value && (value.toLowerCase() === 'false' || value.toLowerCase() === 'no')"
                            >
                                <span>{{ $t('common:modules.tools.compareFeatures.trueFalse.false') }}</span>
                            </p>
                            <p v-else-if="isPhoneNumber(value)">
                                <a :href="getPhoneNumberAsWebLink(value)">{{ value }}</a>
                            </p>
                            <p v-else-if="isEmailAddress(value)">
                                <a :href="`mailto:${value}`">{{ value }}</a>
                            </p>
                            <p
                                v-else-if="key === 'col-1' || index === 0"
                                class="bold"
                            >
                                {{ beautifyKey($t(value)) }}
                            </p>
                            <p
                                v-else-if="typeof value === 'string' && value.includes(';') && key.includes('SCHULEN')"
                            >
                                <span v-html="toBold(value, key)" />
                            </p>
                            <p
                                v-else-if="typeof value === 'string' && value.includes('|')"
                            >
                                <span v-html="removeVerticalBar(value)" />
                            </p>
                            <p
                                v-else-if="typeof value === 'string' && value.includes('<br>')"
                            >
                                <span v-html="value" />
                            </p>
                            <p v-else>
                                {{ value }}
                            </p>
                        </td>
                    </template>
                    <template
                        v-if="enableMoreInfo"
                    >
                        <td
                            v-for="(value, key) in column"
                            :key="'tool-compareFeatures-td' + key"
                        >
                            <span
                                v-if="index === 0 && key !== 'col-1'"
                                class="close bootstrap-icon remove-feature"
                                type="button"
                                :title="$t('common:modules.tools.compareFeatures.removeFromList')"
                                role="button"
                                tabindex="0"
                                @click="removeFeatureFromPreparedList({features: listOfFeatures, featureId: key, selectedLayer: selectedLayer})"
                                @keydown.enter="removeFeatureFromPreparedList({features: listOfFeatures, featureId: key, selectedLayer: selectedLayer})"
                            >
                                <i class="bi-x-lg" />
                            </span>
                            <p v-if="isWebLink(value)">
                                <a
                                    :href="value"
                                    target="_blank"
                                >{{ value }}</a>
                            </p>
                            <p
                                v-else-if="value && value.toLowerCase() === 'true'"
                            >
                                <span>{{ $t('common:modules.tools.compareFeatures.trueFalse.true') }}</span>
                            </p>
                            <p
                                v-else-if="value && (value.toLowerCase() === 'false' || value.toLowerCase() === 'no')"
                            >
                                <span>{{ $t('common:modules.tools.compareFeatures.trueFalse.false') }}</span>
                            </p>
                            <p v-else-if="isPhoneNumber(value)">
                                <a :href="getPhoneNumberAsWebLink(value)">{{ value }}</a>
                            </p>
                            <p v-else-if="isEmailAddress(value)">
                                <a :href="`mailto:${value}`">{{ value }}</a>
                            </p>
                            <p
                                v-else-if="key === 'col-1' || index === 0"
                                class="bold"
                            >
                                {{ beautifyKey($t(value)) }}
                            </p>
                            <p
                                v-else-if="typeof value === 'string' && value.includes(';') && key.includes('SCHULEN')"
                            >
                                <span v-html="toBold(value, key)" />
                            </p>
                            <p
                                v-else-if="typeof value === 'string' && value.includes('|')"
                            >
                                <span v-html="removeVerticalBar(value)" />
                            </p>
                            <p
                                v-else-if="typeof value === 'string' && value.includes('<br>')"
                            >
                                <span v-html="value" />
                            </p>
                            <p v-else>
                                {{ value }}
                            </p>
                        </td>
                    </template>
                </tr>
            </tbody>
        </table>
    </Component>
</template>

<style lang="scss" scoped>
    @import "~/css/mixins.scss";
    @import "~variables";

    #tool-compareFeatures {
        z-index: -1;
        display: inline-flex;
        width: 100%;
    }
    .remove-feature {
        top: 0 !important;
        left: 0;
        &:focus {
            @include primary_action_focus;
        }
        &:hover {
            @include primary_action_hover;
        }
    }
    table {
        font-family: $font_family_default;
        border-collapse: collapse;
        table-layout: fixed;
        width: 100%;
        a {
            color: darken($secondary_focus, 10%);
            padding: 2px;
            &:hover{
                @include primary_action_hover;
            }
        }
        tr {
            &:first-child {
                max-width: 25px !important;
            }
            &:nth-child(odd) {
                background-color: $white;
            }
            &:nth-child(even) {
                background-color: $light_grey;
            }
        }
        td {
            padding: 8px;
            text-align: left;
            border-left: 1px solid $light_grey;
            vertical-align: top;
            &:nth-child(1) {
                width: 20%;
                border-style: none;
            }
        }
        p {
            overflow-wrap: break-word;
            color: $black;
        }
    }
    .close {
        float: right;
        padding: 5px;
    }
</style>
