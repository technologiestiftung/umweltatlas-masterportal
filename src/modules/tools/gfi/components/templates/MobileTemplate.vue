<script>
import DefaultTheme from "../themes/default/components/DefaultTheme.vue";
import SensorTheme from "../themes/sensor/components/SensorTheme.vue";
import getTheme from "../../utils/getTheme";

export default {
    name: "MobileTemplate",
    components: {
        DefaultTheme,
        SensorTheme
    },
    props: {
        feature: {
            type: Object,
            required: true
        }
    },
    data: function () {
        return {reactOnOutsideClick: false};
    },
    computed: {
        /**
         * Returns the title of the gfi.
         * @returns {String} the title
         */
        title: function () {
            return this.feature.getTitle();
        },

        /**
         * Returns the theme in which the feature should be displayed.
         * It only works if the theme has the same name as the theme component, otherwise the default theme will be used
         * @returns {String} the name of the theme
         */
        theme: function () {
            return getTheme(this.feature.getTheme(), this.$options.components, this.$gfiThemeAddons);
        }
    },
    mounted: function () {
        this.$nextTick(function () {
            this.showMobileComponent();
            // add reaction to click event later, else: if clicked to open it is recognized as a click outside and close is called
            setTimeout(() => {
                this.reactOnOutsideClick = true;
            }, 400);
        });
    },
    methods: {
        close () {
            const modal = document.querySelector(".modal");

            modal.classList.remove("show");
            this.$emit("close");
        },
        closeByClickOutside: function (event) {
            // stop event bubbling
            if (!this.reactOnOutsideClick || event.target !== this.$el) {
                return;
            }
            const modal = document.querySelector(".modal");

            modal.classList.remove("show");
            this.close();
        },
        /**
         * it will show this mobile component if it is switched from attached theme.
         * the method is to fore to insert this component into parent gfi element.
         * @returns {void}
         */
        showMobileComponent: function () {
            if (!document.getElementsByClassName("modal-dialog").length && document.getElementsByClassName("gfi").length) {
                document.getElementsByClassName("gfi")[0].appendChild(this.$el);
            }
            else {
                const modal = document.querySelector(".modal");

                modal.classList.add("show");
            }
        }
    }
};
</script>

<template>
    <div
        class="modal"
        role="button"
        tabindex="0"
        @click="closeByClickOutside"
        @keydown.enter="closeByClickOutside"
    >
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <span
                        type="button"
                        class="close bootstrap-icon"
                        aria-label="Close"
                        role="button"
                        tabindex="0"
                        @click="close"
                        @keydown.enter="close"
                    >
                        <i class="bi-x-lg" />
                    </span>
                    <h5 class="modal-title">
                        {{ $t(title) }}
                    </h5>
                </div>
                <div class="modal-body">
                    <component
                        :is="theme"
                        :feature="feature"
                    />
                </div>
                <div class="modal-footer">
                    <slot name="footer" />
                </div>
            </div>
        </div>
    </div>
</template>


<style lang="scss" scoped>
@import "~variables";

.modal-mask {
    position: fixed;
    z-index: 9999;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: $shadow_overlay;
}
.show {display: block;}

.modal-header {
    padding: 0 15px;
    button {
        font-size: $font-size-lg;
        padding-top: 13px;
        opacity: 0.6;
    }
    .modal-title {
        margin: 10px 0;
    }
}

.modal-body {
    overflow-y: auto;
    max-height: 80vh;
    padding: 0;
    table {
        margin-bottom: 0;
    }
}

.modal-footer {
    color: $dark_grey;
    padding: 0;
    font-size: $font_size_huge;

    .pager {
        background-color: $secondary;
        padding: 6px;
        cursor: pointer;
        width: 50%;
        margin: 0;
        text-align: center;
        list-style: none;
    }

    .pager-left {
        float: left;
        border-right: 1px solid $light_grey;
    }

    .pager-right {
        float: right;
    }

    .disabled {
        cursor: not-allowed;
        background-color: $light_grey_inactive_contrast;
        opacity: 0.2;
    }
}

</style>
