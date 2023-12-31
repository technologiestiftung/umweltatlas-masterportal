<script>
import {mapActions} from "vuex";
import {RoutingGeosearchResult} from "../utils/classes/routing-geosearch-result";

export default {
    name: "RoutingCoordinateInput",
    props: {
        waypoint: {
            type: Object,
            required: true
        },
        countWaypoints: {
            type: Number,
            required: true
        }
    },
    data () {
        return {
            search: this.waypoint.getDisplayName()
                ? this.waypoint.getDisplayName()
                : "",
            awaitingSearch: false,
            searchResults: [],
            ignoreNextSearchChange: false,
            isFocused: false
        };
    },
    computed: {
        /**
         * Computed value for the waypoint display name to watch for changes
         * @returns {String} the display name for the waypoint
         */
        waypointDisplayName () {
            return this.waypoint.getDisplayName();
        }
    },
    watch: {
        /**
         * Resets the input text string and makes sure that no additional request is made if the waypoint display name changes
         * @param {String} val new display name
         * @return {void}
         */
        waypointDisplayName: function (val) {
            this.ignoreNextSearchChange = true;
            this.search = !val ? "" : val;
        },
        /**
         * Starts a request if no new input comes after a short delay.
         * @returns {void}
         */
        search: function () {
            if (this.ignoreNextSearchChange) {
                this.ignoreNextSearchChange = false;
                return;
            }
            if (!this.awaitingSearch) {
                setTimeout(async () => {
                    this.awaitingSearch = false;
                    const isWgs84Coordinate = this.isInputtextWgs84Coordinate(this.search);

                    if (isWgs84Coordinate) {
                        await this.selectWgs84Coordinate(isWgs84Coordinate);
                    }
                    else {
                        this.searchResults = await this.fetchCoordinatesByText({
                            search: this.search
                        });
                    }
                }, 1000);
            }
            this.awaitingSearch = true;
        }
    },
    methods: {
        ...mapActions("Tools/Routing", ["fetchCoordinatesByText", "transformCoordinatesWgs84ToLocalProjection"]),
        /**
         * Selects a result from the external service provider.
         * @param {RoutingGeosearchResult} searchResult which was selected by the user
         * @returns {void}
         */
        selectSearchResult (searchResult) {
            if (!(searchResult instanceof RoutingGeosearchResult)) {
                return;
            }
            this.waypoint.setFromGeosearchResult(searchResult);
            this.ignoreNextSearchChange = true;
            this.search = searchResult.getDisplayName();
            this.searchResults = [];
            this.$emit("searchResultSelected");
        },
        /**
         * Passes the input wgs84 coordinate to the waypoint
         * @param {[Number, Number]} wgs84Coordinate which was entered in the input text
         * @returns {void}
         */
        async selectWgs84Coordinate (wgs84Coordinate) {
            this.waypoint.setCoordinates(await this.transformCoordinatesWgs84ToLocalProjection(wgs84Coordinate));
            this.waypoint.setDisplayName(this.search);
            this.searchResults = [];
            this.$emit("searchResultSelected");
        },
        /**
         * Resets all input by the user and clears the search results.
         * @returns {void}
         */
        resetInput () {
            this.ignoreNextSearchChange = true;
            this.searchResults = [];
            if (this.waypoint.getDisplayName()) {
                this.search = this.waypoint.getDisplayName();
            }
            else {
                this.search = "";
            }
        },
        /**
         * Checks if the current input text string is in the lat, lng format
         * @returns {Boolean} true if current input text is in the lat, lng format in the wgs84 range
         */
        isInputtextWgs84Coordinate () {
            if (typeof this.search !== "string") {
                return false;
            }
            const [latString, lngString] = this.search.split(", "),
                lat = Number(latString),
                lng = Number(lngString);

            if (!latString || !lngString) {
                return false;
            }
            if (!isFinite(lat) || Math.abs(lat) > 90 || !isFinite(lng) || Math.abs(lng) > 180) {
                return false;
            }

            return [lat, lng];
        },
        /**
         * Creates placeholder text for the input field
         * @returns {String} placeholder text
         */
        getPlaceholder () {
            if (this.waypoint.index === 0) {
                return i18next.t("common:modules.tools.routing.startpoint");
            }
            else if (this.waypoint.index === this.countWaypoints - 1) {
                return i18next.t("common:modules.tools.routing.endpoint");
            }
            return i18next.t("common:modules.tools.routing.waypoint");
        }
    }
};
</script>

<template>
    <div class="form-group-sm mx-0 mb-4">
        <div class="d-flex justify-content-between">
            <label
                :id="'routingCoordinateInput_' + waypoint.index"
                :for="'routingCoordinateInput_' + waypoint.index"
                class="col-md-11 d-flex pr-0 pl-0"
            >
                <input
                    :id="'routingCoordinateInput_' + waypoint.index"
                    v-model="search"
                    type="text"
                    class="col-md-11 form-control form-control-sm"
                    :placeholder="getPlaceholder()"
                    autocomplete="off"
                    @focus="isFocused = true"
                    @blur="isFocused = false"
                >
                <span
                    v-if="search.length > 0 && search !== waypointDisplayName"
                    class="bootstrap-icon pointer form-control-feedback"
                    role="button"
                    tabindex="0"
                    @click="resetInput()"
                    @keydown.enter="resetInput()"
                >
                    <i class="bi-x-lg" />
                </span>
            </label>
            <div class="d-flex">
                <div class="justify-content-between">
                    <div class="h-50">
                        <span
                            v-show="waypoint.index !== 0"
                            class="bootstrap-icon pointer"
                            :title="$t('common:modules.tools.routing.moveWaypointUp')"
                            role="button"
                            tabindex="0"
                            @click="$emit('moveWaypointUp')"
                            @keydown.enter="$emit('moveWaypointUp')"
                        >
                            <i class="bi-chevron-up" />
                        </span>
                    </div>
                    <div class="h-50">
                        <span
                            v-show="waypoint.index !== countWaypoints - 1"
                            class="bootstrap-icon pointer"
                            :title="$t('common:modules.tools.routing.moveWaypointDown')"
                            role="button"
                            tabindex="0"
                            @click="$emit('moveWaypointDown')"
                            @keydown.enter="$emit('moveWaypointDown')"
                        >
                            <i class="bi-chevron-down" />
                        </span>
                    </div>
                </div>
                <span
                    class="m-2 bootstrap-icon pointer"
                    :title="$t('common:modules.tools.routing.deleteWaypoint')"
                    role="button"
                    tabindex="0"
                    @click="$emit('removeWaypoint')"
                    @keydown.enter="$emit('removeWaypoint')"
                >
                    <i class="bi-x-lg" />
                </span>
            </div>
        </div>

        <ul
            v-show="searchResults.length > 0 && isFocused"
            class="dropdown-menu-search dropdown-menu-left"
        >
            <li
                v-for="(searchResult, index) of searchResults"
                :key="index"
                role="button"
                tabindex="0"
                class="list-group-item"
                @mousedown="selectSearchResult(searchResult)"
            >
                {{ searchResult.displayName }}
            </li>
        </ul>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";


label {
    width: 300px;
  margin-bottom: 0;
}
.bootstrap-icon.form-control-feedback {
    color: $dark_grey;
    pointer-events: all;
    margin-left: -20px;
    margin-top: 8px;
}
.pointer {
    cursor: pointer;
}

.dropdown-menu-search {
    width: 300px;
    top: unset;
    left: 20px;
}
</style>
