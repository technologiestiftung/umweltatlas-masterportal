<script>
export default {
    name: "EntityAttribute",
    props: {
        title: {
            type: String,
            default: "",
            required: false
        },
        label: {
            type: String,
            required: true
        },
        widthClasses: {
            type: Array,
            required: true
        },
        value: {
            type: String,
            required: true
        },
        buttons: {
            type: Boolean,
            default: true,
            required: false
        },
        keepHeight: {
            type: Boolean,
            default: false,
            required: false
        },
        disabled: {
            type: Boolean,
            default: false,
            required: false
        },
        formGroup: {
            type: Boolean,
            default: true,
            required: false
        }
    },
    emits: ["input", "increment", "increment-shift", "decrement", "decrement-shift"]
};
</script>

<template>
    <div
        :id="title"
        :class="[{'form-group form-group-sm': formGroup}, 'row']"
    >
        <label
            :class="widthClasses[0] + ' col-form-label'"
            :for="title + '-field'"
        >
            {{ label }}
        </label>
        <div :class="[widthClasses[1], {'position-control': buttons}]">
            <input
                :id="title + '-field'"
                class="form-control form-control-sm"
                :class="{'position-input': buttons || keepHeight}"
                type="text"
                :disabled="disabled"
                :value="value"
                @input="$emit('input', $event.target.value)"
            >
            <div
                v-if="buttons"
                :id="title + '-buttons'"
            >
                <button
                    class="btn btn-primary btn-sm btn-pos"
                    :title="$t(`common:modules.tools.modeler3D.entity.captions.incrementTooltip`)"
                    @click.exact="$emit('increment')"
                    @click.shift="$emit('increment-shift')"
                >
                    <i class="bi bi-arrow-up" />
                </button>
                <button
                    class="btn btn-primary btn-sm btn-pos"
                    :title="$t(`common:modules.tools.modeler3D.entity.captions.incrementTooltip`)"
                    @click.exact="$emit('decrement')"
                    @click.shift="$emit('decrement-shift')"
                >
                    <i class="bi bi-arrow-down" />
                </button>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    @import "~/css/mixins.scss";
    @import "~variables";

    .btn-pos {
        padding: 0.25em;
    }

    .btn-primary {
        &:focus {
            @include primary_action_focus;
        }
        &:hover {
            @include primary_action_hover;
        }
        &:active {
            transform: scale(0.98);
        }
    }

    .position-control {
        display: flex;
        gap: 0.25em;
    }

    .position-input {
        height: 3.8em;
    }

    .row {
        align-items: center;
    }
</style>
