<script>
import {translateKeyWithPlausibilityCheck} from "../../../../utils/translateKeyWithPlausibilityCheck.js";

export default {
    name: "SnippetInfo",
    props: {
        info: {
            type: [String, Boolean],
            required: false,
            default: false
        },
        translationKey: {
            type: String,
            required: true
        }
    },
    data () {
        return {
            showInfo: false
        };
    },
    computed: {
        infoText () {
            if (typeof this.info === "boolean") {
                const translationKey = "common:modules.tools.filter.info." + this.translationKey;

                return this.translateKeyWithPlausibilityCheck(translationKey, key => this.$t(key));
            }
            else if (typeof this.info === "string") {
                return this.translateKeyWithPlausibilityCheck(this.info, key => this.$t(key));
            }
            return "";
        }
    },
    methods: {
        translateKeyWithPlausibilityCheck,
        /**
         * Toggles the info.
         * @returns {void}
         */
        toggleInfo () {
            this.showInfo = !this.showInfo;
        }
    }
};
</script>

<template>
    <div v-if="info">
        <div class="info-icon">
            <span
                :class="['bi bi-info-circle-fill', showInfo ? 'opened' : '']"
                role="button"
                tabindex="0"
                @click="toggleInfo()"
                @keydown.enter="toggleInfo()"
            />
        </div>
        <div
            v-show="showInfo"
            class="bottom"
        >
            <div
                class="info-text"
                role="button"
                tabindex="0"
                @click="toggleInfo()"
                @keydown="toggleInfo()"
            >
                <span>{{ infoText }}</span>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    @import "~/css/mixins.scss";
    @import "~variables";
    .bottom {
        position: sticky;
        width: 340px;
        float: left;
        z-index: 1001;
        background-color: rgb(241, 241, 241, 0.95);
    }
    .info-icon {
        float: right;
        font-size: $font-size-lg;
        color: $dark_grey;
    }
    .info-icon .opened {
        color: lighten($dark_grey, 20%);
    }
    .info-icon:hover {
        cursor: pointer;
        color: lighten($dark_grey, 15%);
    }
    .info-text {
        border: 1px solid $light_grey;
        border-radius: 5px;
        font-size: $font-size-sm;
        padding: 15px 10px;
        cursor: pointer;
    }
</style>
