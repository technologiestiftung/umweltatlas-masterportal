<script>
/**
 * ControlIcon component to be used by controls to display
 * clickable control buttons.
 */
export default {
    name: "ControlIcon",
    props: {
        /** Name of the bootstrap icon, with or without prefix 'bi-' */
        iconName: {
            type: String,
            required: true,
        },
        /** Whether the icon is currently clickable or marked disabled */
        disabled: {
            type: Boolean,
            default: false,
        },
        /** Tooltip text */
        title: {
            type: String,
            required: true,
        },
        /** onClick function of the button element */
        onClick: {
            type: Function,
            default: () =>
                console.warn(
                    "No onClick function was defined on this ControlIcon."
                ),
        },
        /** if true, icon is rendered as smaller inline-block */
        inline: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        /**
         * @returns {String} icon name with added prefix 'bi-' if it was missing
         */
        iconClass() {
            return this.iconName.startsWith("bi-")
                ? this.iconName
                : `bi-${this.iconName}`;
        },
    },
};
</script>

<template>
    <button
        type="button"
        :tabindex="disabled ? '-1' : '0'"
        :class="[
            'control-icon',
            'bootstrap-icon',
            inline ? 'inline' : 'standalone',
        ]"
        :title="title"
        :disabled="disabled"
        @click.stop="onClick"
        @keyup.space.stop.prevent="onClick"
    >
        <!-- special solution for zoom buttons: zoom-in -->
        <i v-if="iconClass === 'bi-masterportal-zoom-in'" :class="iconClass">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                fill="currentColor"
                class="bi bi-plus-square"
                viewBox="0 0 16 16"
            >
                <path
                    d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"
                />
                <path
                    d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"
                />
            </svg>
        </i>
        <!-- special solution for zoom buttons: zoom-out -->
        <i v-if="iconClass === 'bi-masterportal-zoom-out'" :class="iconClass">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                fill="currentColor"
                class="bi bi-dash-square"
                viewBox="0 0 16 16"
            >
                <path
                    d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"
                />
                <path
                    d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8"
                />
            </svg>
        </i>
        <!-- children should usually be placed absolutely in relation to ControlIcon -->
        <i v-else :class="iconClass" />
        <slot />
    </button>
</template>

<style lang="scss" scoped>
@import "~variables";

.standalone {
    display: block;
    text-align: center;
    top: auto;
    margin: 5px;

    font-size: calc(#{$icon_length} - 0.35 * #{$icon_length});
    height: $icon_length;
    width: $icon_length;

    box-shadow: 0 6px 12px $shadow;
}

.inline {
    display: inline-block;
    text-align: center;
    top: auto;

    font-size: calc(#{$icon_length_small} - 0.35 * #{$icon_length_small});
    width: $icon_length_small;
    height: $icon_length_small;
}

.control-icon {
    background-color: $primary;
    color: $white;

    pointer-events: all;
    cursor: pointer;
    border: 0;

    /* position icon in center of button */
    > i {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        // adjust line-height to use same height as ::before Element
        line-height: 0;
    }

    /* pseudo-class state effects */
    &:hover {
        background-color: lighten($primary, 10%);
    }
    &:focus {
        background-color: lighten($primary, 15%);
        outline: 1px solid lighten($primary, 15%);
    }
    &:active {
        background-color: lighten($primary, 5%);
    }

    &:disabled {
        background-color: $light-grey;
        color: $dark_grey;
        cursor: default;
    }
}
.bi-masterportal-zoom-in,
.bi-masterportal-zoom-out {
    color: $white;
}
/* TODO: Since every bootstrap-icon is supported via config, rules for every bootstrap-icon should exist here */
</style>

