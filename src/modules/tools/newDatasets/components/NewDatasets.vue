<script>
import { mapGetters, mapMutations } from "vuex";
import { getComponent } from "../../../../utils/getComponent";
import ToolTemplate from "../../ToolTemplate.vue";
// import getters from "../store/gettersNewDatasets";
// import mutations from "../store/mutationsNewDatasets";
import getters from "../store/gettersScaleSwitcher";
import mutations from "../store/mutationsScaleSwitcher";

/**
 * Tool to switch the scale of the map. Listens to changes of the map's scale and sets the scale to this value.
 */
export default {
    name: "NewDatasets",
    components: {
        ToolTemplate,
    },
    computed: {
        ...mapGetters("Tools/NewDatasets", Object.keys(getters)),
    },
    /**
     * Lifecycle hook: adds a "close"-Listener to close the tool.
     * @returns {void}
     */
    created() {
        // this.scales = this.getView.get("options").map((option) => option.scale);
        this.$on("close", this.close);
    },
    methods: {
        ...mapMutations("Tools/NewDatasets", Object.keys(mutations)),

        /**
         * Sets active to false.
         * @returns {void}
         */
        close() {
            this.setActive(false);

            const model = getComponent(this.$store.state.Tools.NewDatasets.id);

            if (model) {
                model.set("isActive", false);
            }
        },
    },
};
</script>

<template lang="html">
    <ToolTemplate
        :title="$t(name)"
        :icon="icon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivate-gfi="deactivateGFI"
    >
        <template #toolBody>
            <div v-if="active" id="scale-switcher" class="row">
                <h3>{{ $t("modules.tools.newDatasets.header") }}</h3>
                <div class="table-wrapper-main">
                    <div class="table-wrapper">
                        <table>
                            <tr>
                                <th>
                                    {{ $t("modules.tools.newDatasets.date") }}
                                </th>
                                <th>
                                    {{
                                        $t(
                                            "modules.tools.newDatasets.datatitle"
                                        )
                                    }}
                                </th>
                            </tr>
                            <tr v-for="(dataset, i) in datasets" :key="i">
                                <td>{{ dataset.datum }}</td>
                                <td>{{ dataset.name }}</td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        </template>
    </ToolTemplate>
</template>

<style lang="scss" scoped>
@import "~variables";

.table-wrapper-main {
    padding: 0px 10px;
}
.table-wrapper {
    padding: 10px;
    background-color: #edf8f4;
}

tr:hover {
    background-color: #1a4435;
    color: white;
}

h3 {
    margin-bottom: 16px;
}

table {
    width: 100%;

    tr {
        border-bottom: 1px solid #cccccc;

        th:first-child {
            border-right: 1px solid #cccccc;
            width: 60px;
        }

        td:first-child {
            border-right: 1px solid #cccccc;
            width: 60px;
        }
    }

    th {
        padding: 8px;
    }

    td {
        padding: 8px;
    }
}
</style>

