<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import actions from "../store/actionsModeler3D";
import getters from "../store/gettersModeler3D";
import mutations from "../store/mutationsModeler3D";
import EntityAttribute from "./ui/EntityAttribute.vue";
import EntityAttributeSlider from "./ui/EntityAttributeSlider.vue";
import {adaptCylinderToEntity, adaptCylinderToGround} from "../utils/draw";

export default {
    name: "Modeler3DEntityModel",
    components: {
        EntityAttribute,
        EntityAttributeSlider
    },
    computed: {
        ...mapGetters("Tools/Modeler3D", Object.keys(getters)),

        nameString: {
            get () {
                return this.getModelNameById(this.currentModelId);
            },
            set (value) {
                this.setModelName(value);
            }
        },
        showExtrudedHeight: function () {
            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                entity = entities.getById(this.currentModelId);

            return Boolean(entity?.polygon && entity?.wasDrawn);
        },
        showPositioning: function () {
            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                entity = entities.getById(this.currentModelId);

            return Boolean(entity?.polygon || !entity?.wasDrawn);
        },
        showWidth: function () {
            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                entity = entities.getById(this.currentModelId);

            return Boolean(entity?.polyline && entity?.wasDrawn);
        },
        /**
         * The rotation angle of the entity.
         * @type {string}
         * @name rotationString
         * @memberof Modeler3DEntityModel
         * @vue-computed
         * @vue-prop {number} rotation - The current rotation angle.
         * @vue-propsetter {number} rotation - Sets the rotation angle, clamping it between -180 and 180 degrees.
         */
        rotationString: {
            get () {
                return this.rotation.toString();
            },
            set (value) {
                let adjustedValue = parseInt(value, 10);

                if (adjustedValue < -180) {
                    adjustedValue = -180;
                }
                else if (adjustedValue > 180) {
                    adjustedValue = 180;
                }
                this.setRotation(adjustedValue);
                this.rotate();
            }
        },
        scaleString: {
            get () {
                return this.scale.toFixed(1);
            },
            set (value) {
                let adjustedValue = parseFloat(value.split());
                const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities;

                if (adjustedValue < 0.1) {
                    adjustedValue = 0.1;
                }
                this.setScale(adjustedValue);
                entities.getById(this.currentModelId).model.scale = this.scale;
            }
        },
        extrudedHeightString: {
            get () {
                return this.extrudedHeight.toFixed(2);
            },
            set (value) {
                let adjustedValue = parseFloat(value);

                if (adjustedValue < 0.01) {
                    adjustedValue = 0.01;
                }
                this.setExtrudedHeight(adjustedValue);
                this.updateExtrudedHeight();
            }
        },
        lineWidthString: {
            get () {
                return this.lineWidth.toFixed(2);
            },
            set (value) {
                let adjustedValue = parseFloat(value);
                const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities;

                if (adjustedValue < 0.01) {
                    adjustedValue = 0.01;
                }
                this.setLineWidth(adjustedValue);
                entities.getById(this.currentModelId).polyline.width = this.lineWidth;
            }
        },
        eastingString: {
            get () {
                return this.prettyCoord(this.coordinateEasting);
            },
            set (value) {
                this.setCoordinateEasting(this.formatCoord(value));
                this.updateEntityPosition();
            }
        },
        northingString: {
            get () {
                return this.prettyCoord(this.coordinateNorthing);
            },
            set (value) {
                this.setCoordinateNorthing(this.formatCoord(value));
                this.updateEntityPosition();
            }
        },
        heightString: {
            get () {
                return this.height.toFixed(2);
            },
            set (value) {
                this.setHeight(this.formatCoord(value));
                this.updateEntityPosition();
            }
        }
    },
    methods: {
        ...mapActions("Tools/Modeler3D", Object.keys(actions)),
        ...mapMutations("Tools/Modeler3D", Object.keys(mutations)),

        /**
         * Called if selection of projection changed. Sets the current projection to state and updates the UI.
         * @param {Event} event changed selection event
         * @returns {void}
         */
        selectionChanged (event) {
            if (event.target.value) {
                this.newProjectionSelected(event.target.value);
            }
        },
        /**
         * Handles the change event of the "Adapt to Height" checkbox.
         * Updates the adaptToHeight state and triggers the entity position update if the checkbox is checked.
         * @param {boolean} value - The new value of the checkbox.
         * @returns {void}
         */
        checkedAdapt (value) {
            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                entity = entities.getById(this.currentModelId);

            if (entity) {
                entity.clampToGround = value;
                this.setAdaptToHeight(value);
                this.updateEntityPosition();
            }
        },
        /**
         * Updates the extrudedHeight of the polygon and adjusts the active cylinders length and position.
         * @returns {void}
         */
        updateExtrudedHeight () {
            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                entity = entities.getById(this.currentModelId);

            if (entity && entity.polygon instanceof Cesium.PolygonGraphics) {
                entity.polygon.extrudedHeight = this.extrudedHeight + entity.polygon.height;
                entities.values.filter(ent => ent.cylinder).forEach(cyl => {
                    cyl.cylinder.length = this.extrudedHeight + 5;
                    cyl.position = entity.clampToGround ? adaptCylinderToGround(cyl, cyl.position.getValue()) : adaptCylinderToEntity(entity, cyl, cyl.position.getValue());
                });
            }
        },
        /**
         * Rotates the current model based on the value of the rotationAngle property.
         * Updates the heading of the model and sets its orientation using the calculated quaternion.
         * @returns {void}
         */
        rotate () {
            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                entity = entities.getById(this.currentModelId),
                modelOrigin = this.wasDrawn ? this.drawnModels : this.importedModels,
                modelFromState = modelOrigin.find(ent => ent.id === entity.id),
                heading = Cesium.Math.toRadians(this.rotation),
                position = entity.wasDrawn ? entity.polygon.hierarchy.getValue().positions[0] : entity.position.getValue(),
                orientationMatrix = Cesium.Transforms.headingPitchRollQuaternion(
                    position,
                    new Cesium.HeadingPitchRoll(heading, 0, 0)
                );

            if (modelFromState && entity) {
                modelFromState.heading = this.rotation;

                if (entity.wasDrawn) {
                    const positions = entity.polygon.hierarchy.getValue().positions,
                        center = this.getCenterFromGeometry(entity),
                        rotatedPositions = positions.map(pos => {
                            const relativePosition = Cesium.Cartesian3.subtract(pos, center),
                                rotatedRelativePosition = Cesium.Matrix3.multiplyByVector(orientationMatrix, relativePosition);

                            return Cesium.Cartesian3.add(rotatedRelativePosition, center, new Cesium.Cartesian3());
                        });

                    entity.polygon.hierarchy = new Cesium.PolygonHierarchy(rotatedPositions);
                }
                else {
                    entity.orientation = orientationMatrix;
                }
            }
        }
    }
};
</script>

<template lang="html">
    <div id="modeler3D-entity-view">
        <p
            class="cta"
            v-html="$t('modules.tools.modeler3D.entity.captions.editInfo')"
        />
        <p
            class="cta"
            v-html="$t('modules.tools.modeler3D.entity.captions.pickupPlace')"
        />
        <p
            v-if="currentProjection.id === 'http://www.opengis.net/gml/srs/epsg.xml#4326'"
            id="projection-warning"
            class="cta red"
            v-html="$t('modules.tools.modeler3D.entity.captions.projectionInfo')"
        />
        <div class="h-seperator" />
        <EntityAttribute
            v-model="nameString"
            title="model-name"
            :label="$t('modules.tools.modeler3D.entity.captions.modelName')"
            :width-classes="['col-md-5', 'col-md-7']"
            :buttons="false"
        />
        <div
            v-if="showPositioning"
            class="h-seperator"
        />
        <div
            v-if="showPositioning"
            id="projection"
            class="form-group form-group-sm row"
        >
            <label
                class="col-md-5 col-form-label"
                for="tool-edit-projection"
            >
                {{ $t("modules.tools.modeler3D.entity.projections.projection") }}
            </label>
            <div class="col-md-7">
                <select
                    class="form-select form-select-sm"
                    aria-label="currentProjection"
                    @change="selectionChanged($event)"
                >
                    <option
                        v-for="(projection, i) in projections"
                        :key="i"
                        :value="projection.id"
                        :SELECTED="projection.id === currentProjection.id"
                    >
                        {{ projection.title ? projection.title : projection.name }}
                    </option>
                </select>
            </div>
        </div>
        <div
            v-if="showPositioning"
            id="position"
        >
            <div class="h-seperator" />
            <EntityAttribute
                v-model="eastingString"
                title="easting"
                :label="$t(getLabel('eastingLabel'))"
                :width-classes="['col-md-5', 'col-md-7']"
                :buttons="currentProjection.id !== 'http://www.opengis.net/gml/srs/epsg.xml#4326'"
                @increment="eastingString = prettyCoord(coordinateEasting + coordAdjusted({shift: false, coordType: 'easting'}))"
                @increment-shift="eastingString = prettyCoord(coordinateEasting + coordAdjusted({shift: true, coordType: 'easting'}))"
                @decrement="eastingString = prettyCoord(coordinateEasting - coordAdjusted({shift: false, coordType: 'easting'}))"
                @decrement-shift="eastingString = prettyCoord(coordinateEasting - coordAdjusted({shift: true, coordType: 'easting'}))"
            />
            <EntityAttribute
                v-model="northingString"
                title="northing"
                :label="$t(getLabel('northingLabel'))"
                :width-classes="['col-md-5', 'col-md-7']"
                :buttons="currentProjection.id !== 'http://www.opengis.net/gml/srs/epsg.xml#4326'"
                @increment="northingString = prettyCoord(coordinateNorthing + coordAdjusted({shift: false, coordType: 'northing'}))"
                @increment-shift="northingString = prettyCoord(coordinateNorthing + coordAdjusted({shift: true, coordType: 'northing'}))"
                @decrement="northingString = prettyCoord(coordinateNorthing - coordAdjusted({shift: false, coordType: 'northing'}))"
                @decrement-shift="northingString = prettyCoord(coordinateNorthing - coordAdjusted({shift: true, coordType: 'northing'}))"
            />
            <EntityAttribute
                v-model="heightString"
                title="height"
                :label="$t('modules.tools.modeler3D.entity.projections.height') + ' [m]'"
                :width-classes="['col-md-5', 'col-md-6']"
                :keep-height="true"
                :buttons="!adaptToHeight"
                :disabled="adaptToHeight"
                :form-group="false"
                @increment="heightString = prettyCoord(height + coordAdjusted({shift: false, coordType: 'height'}))"
                @increment-shift="heightString = prettyCoord(height + coordAdjusted({shift: true, coordType: 'height'}))"
                @decrement="heightString = prettyCoord(height - coordAdjusted({shift: false, coordType: 'height'}))"
                @decrement-shift="heightString = prettyCoord(height - coordAdjusted({shift: true, coordType: 'height'}))"
            />
            <div
                id="adapt-check"
                class="form-group form-group-sm row"
            >
                <div class="col-md-5" />
                <label
                    class="col-md-5 col-form-label"
                    for="adaptHeightCheck"
                >
                    {{ $t("modules.tools.modeler3D.entity.projections.adaptToHeight") }}
                </label>
                <input
                    id="adaptHeightCheck"
                    class="form-check-input check-height"
                    type="checkbox"
                    :checked="adaptToHeight"
                    @change="checkedAdapt($event.target.checked)"
                >
            </div>
        </div>
        <div
            v-if="!wasDrawn"
            id="rotation"
        >
            <div class="h-seperator" />
            <EntityAttribute
                v-model="rotationString"
                :label="$t('modules.tools.modeler3D.entity.captions.rotation') + ' [°]'"
                :width-classes="['col-md-8', 'col-md-3']"
                :buttons="false"
            />
            <EntityAttributeSlider
                v-model="rotationString"
                title="rotation"
                :label="$t('modules.tools.modeler3D.entity.captions.rotationSwitch')"
                @increment="val => rotationString = rotation + val"
                @decrement="val => rotationString = rotation - val"
            />
        </div>
        <div v-if="!wasDrawn">
            <div class="h-seperator" />
            <EntityAttribute
                v-model="scaleString"
                title="scale"
                :label="$t('modules.tools.modeler3D.entity.captions.scale')"
                :width-classes="['col-md-8', 'col-md-4']"
                @increment="scaleString = (scale + 0.1).toFixed(1)"
                @increment-shift="scaleString = (scale + 1).toFixed(1)"
                @decrement="scaleString = (scale - 0.1).toFixed(1)"
                @decrement-shift="scaleString = (scale - 1).toFixed(1)"
            />
        </div>
        <div v-if="showExtrudedHeight">
            <div class="h-seperator" />
            <EntityAttribute
                v-model="extrudedHeightString"
                title="extruded-height"
                :label="$t('modules.tools.modeler3D.draw.captions.extrudedHeight') + ' [m]'"
                :width-classes="['col-md-8', 'col-md-4']"
                @increment="extrudedHeightString = (extrudedHeight + 0.1).toFixed(2)"
                @increment-shift="extrudedHeightString = (extrudedHeight + 1).toFixed(2)"
                @decrement="extrudedHeightString = (extrudedHeight - 0.1).toFixed(2)"
                @decrement-shift="extrudedHeightString = (extrudedHeight - 1).toFixed(2)"
            />
        </div>
        <div v-if="showWidth">
            <div class="h-seperator" />
            <EntityAttribute
                v-model="lineWidthString"
                title="line-width"
                :label="$t('modules.tools.modeler3D.draw.captions.strokeWidth') + ' [Pixel]'"
                :width-classes="['col-md-8', 'col-md-4']"
                @increment="lineWidthString = (lineWidth + 1).toFixed(2)"
                @decrement="lineWidthString = (lineWidth - 1).toFixed(2)"
            />
        </div>
        <div class="h-seperator" />
        <div
            id="footer-buttons"
            class="row justify-content-between"
        >
            <button
                id="tool-import3d-deactivateEditing"
                class="col-5 btn btn-primary btn-sm primary-button-wrapper"
                @click="setCurrentModelId(null)"
            >
                {{ $t("modules.tools.modeler3D.entity.captions.backToList") }}
            </button>
            <button
                id="tool-import3d-deleteEntity"
                class="col-5 btn btn-danger btn-sm delete-button-wrapper"
                @click="confirmDeletion(currentModelId)"
            >
                {{ $t("modules.tools.modeler3D.entity.captions.delete") }}
            </button>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    @import "~/css/mixins.scss";
    @import "~variables";

    .h-seperator {
        margin:12px 0 12px 0;
        border: 1px solid #DDDDDD;
    }

    .primary-button-wrapper {
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

    .delete-button-wrapper {
        color: $white;
        background-color: $light_red;
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
            opacity: 1;
            &.btn-select, &:active, &.active, &:checked, &::selection, &.show, &[aria-expanded="true"] {
                background-color: $light_red;
                border-radius: .25rem;
            }
            background-color: lighten($light_red, 10%);
            color: $light_grey_contrast;
            cursor: pointer;
        }
    }

    .cta {
        margin-bottom:12px;
    }

    .red {
        color: red;
    }

    .position-control {
        display: flex;
        gap: 0.25em;
    }

    .position-input {
        height: 3.8em;
    }

    .check-height {
        width: 1.5em;
        height: 1.5em;

        margin: 0;
    }

    .btn-margin {
        margin-top: 1em;
    }

    .btn-pos {
        padding: 0.25em;
    }

    .row {
        align-items: center;
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
</style>
