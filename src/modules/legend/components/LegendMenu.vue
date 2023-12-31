<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import getters from "../store/gettersLegend";
import mutations from "../store/mutationsLegend";
import actions from "../store/actionsLegend";

export default {
    name: "LegendMenu",
    components: {},
    data () {
        return {
            element: null,
            childNode: null
        };
    },
    computed: {
        ...mapGetters("Legend", Object.keys(getters)),
        ...mapGetters(["mobile", "uiStyle"])
    },
    watch: {
        mobile: function () {
            this.$forceUpdate();
        }
    },
    mounted () {
        this.element = this.$el;
        this.childNode = this.$el.childNodes[0].childNodes[0];
        this.getLegendConfig();

        if (this.uiStyle === "TABLE") {
            document.getElementById("table-tools-menu").append(this.$el);
        }
        else {
            this.replaceMenuChild();
        }
    },
    updated () {
        this.replaceMenuChild();
    },
    methods: {
        ...mapActions("Legend", Object.keys(actions)),
        ...mapMutations("Legend", Object.keys(mutations)),

        /**
         * Replace legend in menu to provide order of menu in config.json.
         * root.replaceChild must be removed on refactoring menu to vue, then only use the else case.
         * @returns {void}
         */
        replaceMenuChild () {
            const root = document.getElementById("root");

            if (root && this.uiStyle !== "TABLE") {
                const span = root.querySelector("[name=legend]");

                if (this.mobile && span?.parentNode) {
                    span.parentNode.style.display = "none";
                    root.insertBefore(this.element, span.parentNode.nextElementSibling);
                }
                else if (!this.mobile && span?.parentNode?.parentNode && this.childNode) {
                    root.replaceChild(this.childNode, span.parentNode.parentNode);
                }
            }
        },

        /**
         * Toggles the visibility of the legend
         * @returns {void}
         */
        toggleLegend () {
            this.setShowLegend(!this.showLegend);
        }
    }
};
</script>

<template>
    <div :class="{ 'table-tool': uiStyle === 'TABLE'}">
        <ul
            v-if="!mobile && uiStyle !== 'TABLE'"
            id="legend-menu"
            class="nav navbar-nav"
        >
            <li
                v-if="showLegendInMenu"
                :class="{ 'open': showLegend }"
                class="nav-item dropdown dropdown-folder legend-menu-item"
                role="button"
                tabindex="0"
                @click="toggleLegend"
                @keydown.enter.stop.prevent="toggleLegend"
                @keydown.space.stop.prevent="toggleLegend"
            >
                <a
                    href="#"
                    class="nav-link dropdown-toggle tabable"
                    tabindex="0"
                    :title="$t(name)"
                >
                    <span class="bootstrap-icon d-sm-none d-md-inline-block">
                        <i :class="icon" />
                    </span>
                    <span class="menuitem">{{ $t(name) }}</span>
                </a>
            </li>
        </ul>
        <li
            v-if="showLegendInMenu && mobile"
            id="legend-menu"
            :class="{ open: showLegend }"
            class="list-group-item ps-1 mobile"
            role="button"
            tabindex="0"
            @click="toggleLegend"
            @keydown.enter="toggleLegend"
        >
            <div class="folder-item d-flex align-items-center">
                <span class="bootstrap-icon d-md-inline-block">
                    <i :class="icon" />
                </span>
                <span class="title">{{ $t(name) }}</span>
            </div>
        </li>
        <a
            v-if="!mobile && uiStyle === 'TABLE'"
            href="#"
            class="dropdown-toggle"
            @click="toggleLegend"
        >
            <span class="bootstrap-icon d-sm-none d-md-inline-block">
                <i :class="icon" />
            </span>
            <span class="menuitem">{{ $t(name) }}</span>
        </a>
    </div>
</template>

<style lang="scss" scoped>
    @import "~variables";
    #legend-menu {
        border-right: none;
        border-top: none;
        font-size: $font_size_big;
        cursor: pointer;
    }
</style>
