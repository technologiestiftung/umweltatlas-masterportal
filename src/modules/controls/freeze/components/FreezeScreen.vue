<script>
import {mapGetters} from "vuex";
import ControlIcon from "../../ControlIcon.vue";
import TableStyleControl from "../../TableStyleControl.vue";
import FreezeScreenWindow from "./FreezeScreenWindow.vue";
import uiStyle from "../../../../utils/uiStyle";

/**
 * Freeze control that allows the user to freeze the current window
 * of desktop and Mobile browser
 */
export default {
    name: "FreezeScreen",
    components: {
        FreezeScreenWindow,
        ControlIcon
    },
    data: function () {
        return {
            isActive: false
        };
    },
    computed: {
        ...mapGetters(["uiStyle"]),

        component () {
            return uiStyle.getUiStyle() === "TABLE" ? TableStyleControl : ControlIcon;
        }
    },
    methods: {
        /**
         * showing the freezed window
         * @returns {void}
         */
        showFreezeWin () {
            this.isActive = true;
        },

        /**
         * hiding the freezed window
         * @returns {void}
         */
        hideFreezeWin () {
            this.isActive = false;
        }
    }
};
</script>

<template>
    <div class="freeze-view-start">
        <component
            :is="component"
            :class="[component ? 'control' : 'Table']"
            :title="$t(`common:modules.controls.freeze.freeze`)"
            :icon-name="'lock-fill'"
            :on-click="showFreezeWin"
        />
        <FreezeScreenWindow
            v-if="isActive"
            @hideFreezeWin="hideFreezeWin"
        />
    </div>
</template>

<style lang="scss" scoped>
    @import "~variables";

    .controls-row-right {
        .freeze-view-start {
            margin-top: 20px;
        }
    }
</style>
