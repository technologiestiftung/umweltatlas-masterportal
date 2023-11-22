<script>
export default {
    name: "IconButton",
    props: {
        interaction: {
            type: Function,
            required: false,
            default: () => {
                return true;
            }
        },
        aria: {
            type: String,
            required: true
        },
        icon: {
            type: String,
            default: null,
            required: false
        },
        classArray: {
            type: Array,
            default: null,
            required: false
        },
        id: {
            type: String,
            default: null,
            required: false
        },
        disabled: {
            type: Boolean,
            default: null,
            required: false
        }
    }
};
</script>

<template>
    <button
        :id="id"
        tabindex="0"
        class="btn d-flex align-items-center justify-items-center mb-auto"
        type="button"
        :title="aria"
        :aria-label="aria"
        :class="classArray"
        :disabled="disabled"
        @click="interaction"
        @keydown.enter="interaction"
    >
        <i
            :class="icon"
            role="img"
        />
    </button>
</template>

<style lang="scss" scoped>
@import "~/css/mixins.scss";
@import "~variables";

.btn {
    position: sticky;
    text-align: center;
    top: auto;
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.5rem;
    border-radius: 50%;
    border: solid $white 1px;
    /* position icon in center of button */
    > i {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        // adjust line-height to use same height as ::before Element
        line-height: 0;
    }
}
</style>
