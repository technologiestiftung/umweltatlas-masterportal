<script>
export default {
    name: "BasicFileImport",
    props: {
        dropZone: {
            type: String,
            default () {
                return i18next.t("common:share-components.import.dropzone");
            },
            required: false
        },
        introFormats: {
            type: String,
            required: true
        }
    },
    emits: [
        "add-file"
    ],
    data () {
        return {
            dzIsDropHovering: false
        };
    },
    computed: {
        /**
         * Returns the additional CSS class for the drop zone based on the hover state.
         * @returns {string} The additional CSS class for the drop zone.
         */
        dropZoneAdditionalClass: function () {
            return this.dzIsDropHovering ? "dzReady" : "";
        }
    },
    mounted () {
        this.setFocusToFirstControl();
    },
    methods: {
        /**
         * Handles the drag enter event for a drop zone and sets the flag to indicate drop hovering.
         * @returns {void}
         */
        onDZDragenter () {
            this.dzIsDropHovering = true;
        },
        /**
         * Handles the drag end event for a drop zone and resets the flag indicating drop hovering.
         * @returns {void}
         */
        onDZDragend () {
            this.dzIsDropHovering = false;
        },
        /**
         * Handles the mouse enter event for a drop zone and sets the flag to indicate hovering.
         * @returns {void}
         */
        onDZMouseenter () {
            this.dzIsHovering = true;
        },
        /**
         * Handles the mouse leave event for a drop zone and resets the flag indicating hovering.
         * @returns {void}
         */
        onDZMouseleave () {
            this.dzIsHovering = false;
        },
        /**
         * Handles the input change event and processes the selected files.
         * @param {Event} e - The input change event object.
         * @returns {void}
         */
        onInputChange (e) {
            if (e.target.files !== undefined) {
                this.$emit("add-file", e.target.files);
            }
        },
        /**
         * Handles the drop event and processes the dropped files.
         * @param {Event} e - The drop event object.
         * @returns {void}
         */
        onDrop (e) {
            this.dzIsDropHovering = false;
            if (e.dataTransfer.files !== undefined) {
                this.$emit("add-file", e.dataTransfer.files);
            }
        },
        /**
         * Triggers a click event on the file input element when the spacebar or enter key is pressed.
         * @param {Event} event - The keydown event object.
         * @returns {void}
         */
        triggerClickOnFileInput (event) {
            if (event.which === 32 || event.which === 13) {
                this.$refs["upload-input-file"].click();
            }
        },
        /**
         * Sets the focus to the first control
         * @returns {void}
         */
        setFocusToFirstControl () {
            this.$nextTick(() => {
                if (this.$refs["upload-label"]) {
                    this.$refs["upload-label"].focus();
                }
            });
        }
    }
};
</script>

<template lang="html">
    <div id="basic-file-import">
        <slot />
        <p
            class="cta"
            v-html="introFormats"
        />
        <div
            class="vh-center-outer-wrapper drop-area-fake"
            :class="dropZoneAdditionalClass"
        >
            <div class="vh-center-inner-wrapper">
                <p class="caption">
                    {{ dropZone }}
                </p>
            </div>

            <!-- eslint-disable-next-line vuejs-accessibility/mouse-events-have-key-events -->
            <div
                class="drop-area"
                role="presentation"
                @drop.prevent="onDrop"
                @dragover.prevent
                @dragenter.prevent="onDZDragenter"
                @dragleave="onDZDragend"
                @mouseenter="onDZMouseenter"
                @mouseleave="onDZMouseleave"
            />
            <!--
                The previous element does not provide a @focusin or @focus reaction as would
                be considered correct by the linting rule set. Since it's a drop-area for file
                dropping by mouse, the concept does not apply. Keyboard users may use the
                matching input fields.
            -->
        </div>

        <div>
            <label
                ref="upload-label"
                class="upload-button-wrapper"
                role="button"
                tabindex="0"
                @keydown="triggerClickOnFileInput"
            >
                <input
                    ref="upload-input-file"
                    type="file"
                    @change="onInputChange"
                >
                {{ $t("share-components.import.browse") }}
            </label>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    @import "~/css/mixins.scss";
    @import "~variables";

    input[type="file"] {
        display: none;
    }
    input[type="button"] {
        display: none;
    }

    .upload-button-wrapper {
        color: $white;
        background-color: $secondary_focus;
        display: block;
        text-align:center;
        padding: 8px 12px;
        cursor: pointer;
        margin:12px 0 0 0;
        font-size: $font_size_big;
        &:focus {
            @include primary_action_focus;
        }
        &:hover {
            @include primary_action_hover;
        }
    }

    .cta {
        margin-bottom:12px;
    }
    .drop-area-fake {
        background-color: $white;
        border-radius: 12px;
        border: 2px dashed $accent;
        padding:24px;
        transition: background 0.25s, border-color 0.25s;

        &.dzReady {
            background-color:$accent_hover;
            border-color:transparent;

            p.caption {
                color: $white;
            }
        }

        p.caption {
            margin:0;
            text-align:center;
            transition: color 0.35s;
            font-family: $font_family_accent;
            font-size: $font-size-lg;
            color: $accent;
        }
    }
    .drop-area {
        position:absolute;
        top:0;
        left:0;
        right:0;
        bottom:0;
        z-index:10;
    }
    .vh-center-outer-wrapper {
        top:0;
        left:0;
        right:0;
        bottom:0;
        text-align:center;
        position:relative;

        &:before {
            content:'';
            display:inline-block;
            height:100%;
            vertical-align:middle;
            margin-right:-0.25em;
        }
    }
    .vh-center-inner-wrapper {
        text-align:left;
        display:inline-block;
        vertical-align:middle;
        position:relative;
    }
</style>
