<script>
import {mapGetters, mapActions, mapMutations} from "vuex";
import actions from "../store/actionsModeler3D";
import getters from "../store/gettersModeler3D";
import mutations from "../store/mutationsModeler3D";
import crs from "@masterportal/masterportalapi/src/crs";
import {adaptCylinderToEntity, adaptCylinderToGround, adaptCylinderUnclamped} from "../utils/draw";

import DrawTypes from "./ui/DrawTypes.vue";
import DrawLayout from "./ui/DrawLayout.vue";
import EntityList from "./ui/EntityList.vue";

let eventHandler = null;

export default {
    name: "Modeler3DDraw",
    components: {
        DrawTypes,
        DrawLayout,
        EntityList
    },
    data () {
        return {
            clampToGround: true,
            currentPosition: null,
            shapeId: null,
            lastAddedPosition: null
        };
    },
    computed: {
        ...mapGetters("Tools/Modeler3D", Object.keys(getters)),
        ...mapGetters("Maps", ["mouseCoordinate"])
    },
    methods: {
        ...mapActions("Tools/Modeler3D", Object.keys(actions)),
        ...mapMutations("Tools/Modeler3D", Object.keys(mutations)),

        /**
         * Called if button in UI is pressed. Starts the drawing process.
         * @returns {void}
         */
        startDrawing () {
            this.setExtrudedHeight(this.currentLayout.extrudedHeight);
            this.setLineWidth(this.currentLayout.strokeWidth);
            this.setIsDrawing(true);
            this.shapeId = null;
            this.currentPosition = {x: 1, y: 1, z: 1};
            this.createCylinder({
                posIndex: this.activeShapePoints.length
            });

            const scene = mapCollection.getMap("3D").getCesiumScene(),
                entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                floatingPoint = entities.values.find(cyl => cyl.id === this.cylinderId);

            floatingPoint.position = this.clampToGround ?
                new Cesium.CallbackProperty(() => adaptCylinderToGround(floatingPoint, this.currentPosition), false) :
                new Cesium.CallbackProperty(() => adaptCylinderUnclamped(floatingPoint, this.currentPosition), false);

            eventHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);

            eventHandler.setInputAction(this.onMouseMove, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            eventHandler.setInputAction(this.addGeometryPosition, Cesium.ScreenSpaceEventType.LEFT_CLICK);
            eventHandler.setInputAction(this.stopDrawing, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
            eventHandler.setInputAction(this.stopDrawing, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        },
        /**
         * Called on mouse move. Repositions the current pin to set the position.
         * @param {Event} event changed mouse position event
         * @returns {void}
         */
        onMouseMove (event) {
            const scene = mapCollection.getMap("3D").getCesiumScene(),
                entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                floatingPoint = entities.values.find(cyl => cyl.id === this.cylinderId);

            if (this.clampToGround) {
                const ray = scene.camera.getPickRay(event.endPosition),
                    position = scene.globe.pick(ray, scene);

                if (Cesium.defined(position)) {
                    document.body.style.cursor = "copy";
                }

                if (this.currentPosition !== position) {
                    this.currentPosition = position;
                }
            }
            else {
                const transformedCoordinates = crs.transformFromMapProjection(mapCollection.getMap("3D").getOlMap(), "EPSG:4326", [this.mouseCoordinate[0], this.mouseCoordinate[1]]),
                    cartographic = Cesium.Cartographic.fromDegrees(transformedCoordinates[0], transformedCoordinates[1]),
                    polygon = entities.values.find(ent => ent.id === this.currentModelId),
                    ignoreObjects = polygon ? [floatingPoint, polygon] : [floatingPoint];

                if (cartographic) {
                    document.body.style.cursor = "copy";
                }

                cartographic.height = scene.sampleHeight(cartographic, ignoreObjects);

                if (this.currentPosition !== Cesium.Cartographic.toCartesian(cartographic)) {
                    this.currentPosition = Cesium.Cartographic.toCartesian(cartographic);
                }
            }
            if (Cesium.defined(this.currentPosition)) {
                this.activeShapePoints.splice(floatingPoint.positionIndex, 1, this.currentPosition);
            }
        },
        /**
         * Called on mouse leftclick. Sets the position of a pin and starts to draw a geometry.
         * When a position is identical to the last placed position, the function is escaped to avoid moving errors of the drawn geometry.
         * @returns {void}
         */
        addGeometryPosition () {
            if (Cesium.Cartesian3.equals(this.currentPosition, this.lastAddedPosition)) {
                return;
            }
            this.lastAddedPosition = this.currentPosition;

            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities;
            let floatingPoint = entities.values.find(cyl => cyl.id === this.cylinderId),
                entity = null;

            if (this.activeShapePoints.length === 1) {
                const scene = mapCollection.getMap("3D").getCesiumScene();

                this.setHeight(this.clampToGround ?
                    scene.globe.getHeight(Cesium.Cartographic.fromCartesian(this.currentPosition)) :
                    scene.sampleHeight(Cesium.Cartographic.fromCartesian(this.currentPosition), [floatingPoint])
                );
                this.drawShape();
            }
            entity = entities.getById(this.shapeId);

            if (this.clampToGround) {
                floatingPoint.position = adaptCylinderToGround(floatingPoint, this.currentPosition);
                this.createCylinder({
                    posIndex: this.activeShapePoints.length
                });
            }
            else {
                floatingPoint.position = entity ? adaptCylinderToEntity(entity, floatingPoint, this.currentPosition) : adaptCylinderUnclamped(floatingPoint, this.currentPosition);

                this.createCylinder({
                    posIndex: this.activeShapePoints.length,
                    length: entity?.polygon ? this.extrudedHeight + entity.polygon.height + 5 : undefined
                });
            }
            floatingPoint = entities.values.find(cyl => cyl.id === this.cylinderId);
            floatingPoint.position = this.clampToGround ?
                new Cesium.CallbackProperty(() => adaptCylinderToGround(floatingPoint, this.currentPosition), false) :
                new Cesium.CallbackProperty(() => entity ? adaptCylinderToEntity(entity, floatingPoint, this.currentPosition) : adaptCylinderUnclamped(floatingPoint, this.currentPosition), false);

            this.activeShapePoints.push(this.currentPosition);
        },
        /**
         * Called on mouse rightclick. Completes the polygon when there are at least 3 corners or deletes it when it has less.
         * @returns {void}
         */
        stopDrawing () {
            if (!this.isDrawing) {
                return;
            }
            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                shape = entities.getById(this.shapeId);

            this.activeShapePoints.pop();

            if (shape?.polygon && this.activeShapePoints.length > 2) {
                shape.polygon.hierarchy = new Cesium.ConstantProperty(new Cesium.PolygonHierarchy(this.activeShapePoints));
            }
            if (shape?.polyline && this.activeShapePoints.length >= 2) {
                shape.polyline.positions = this.activeShapePoints;
            }
            else if (shape && shape.polygon && this.activeShapePoints.length < 3) {
                this.deleteEntity(shape.id);
            }

            this.setActiveShapePoints([]);
            this.removeCylinders();
            this.currentPosition = null;
            this.shapeId = null;
            this.setIsDrawing(false);
            document.body.style.cursor = "auto";
            eventHandler.destroy();
        },
        /**
         * Creates the drawn shape in the EntityCollection and sets its attributes.
         * @returns {void}
         */
        drawShape () {
            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                models = this.drawnModels,
                lastElement = entities.values.filter(ent => !ent.cylinder).pop(),
                lastId = lastElement ? lastElement.id : undefined,
                shapeId = lastId ? lastId + 1 : 1,
                positionData = new Cesium.CallbackProperty(() => {
                    if (this.selectedDrawType === "polygon") {
                        return new Cesium.PolygonHierarchy(this.activeShapePoints);
                    }
                    return this.activeShapePoints;
                }, false);
            let shape;

            if (this.selectedDrawType === "line") {
                shape = {
                    id: shapeId,
                    name: this.drawName ? this.drawName : i18next.t("common:modules.tools.modeler3D.draw.captions.drawing") + ` ${shapeId}`,
                    wasDrawn: true,
                    clampToGround: this.clampToGround,
                    polyline: {
                        material: new Cesium.ColorMaterialProperty(
                            Cesium.Color.fromBytes(...this.currentLayout.strokeColor).withAlpha(1 - this.currentLayout.fillTransparency / 100)
                        ),
                        positions: positionData,
                        clampToGround: this.clampToGround,
                        width: this.lineWidth
                    }
                };
            }
            else if (this.selectedDrawType === "polygon") {
                shape = {
                    id: shapeId,
                    name: this.drawName ? this.drawName : i18next.t("common:modules.tools.modeler3D.draw.captions.drawing") + ` ${shapeId}`,
                    wasDrawn: true,
                    clampToGround: this.clampToGround,
                    polygon: {
                        height: this.height,
                        hierarchy: positionData,
                        material: new Cesium.ColorMaterialProperty(
                            Cesium.Color.fromBytes(...this.currentLayout.fillColor).withAlpha(1 - this.currentLayout.fillTransparency / 100)
                        ),
                        outline: true,
                        outlineColor: Cesium.Color.fromBytes(...this.currentLayout.strokeColor).withAlpha(1 - this.currentLayout.fillTransparency / 100),
                        shadows: Cesium.ShadowMode.ENABLED,
                        extrudedHeight: this.extrudedHeight + this.height
                    }
                };
            }

            entities.add(shape);
            models.push({
                id: shape.id,
                name: shape.name,
                show: true,
                edit: false
            });
            this.setDrawnModels(models);
            this.shapeId = shape.id;
        },
        /**
         * Resets the drawing to adjust to changes
         * @param {Object} layout - The new layout with current values
         * @returns {void}
         */
        resetDrawing (layout) {
            if (layout) {
                this.setCurrentLayout(layout);
            }
            if (this.isDrawing) {
                this.stopDrawing();
                this.startDrawing();
            }
        },
        /**
         * Zooms the camera to the specified entity.
         * @param {string} id - The ID of the entity to zoom to.
         * @returns {void}
         */
        zoomTo (id) {
            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                entity = entities.getById(id);

            if (entity) {
                let height;

                if (entity.polygon) {
                    height = entity.polygon.extrudedHeight.getValue();
                }
                else if (entity.polyline) {
                    height = 0;
                }

                const scene = mapCollection.getMap("3D").getCesiumScene(),
                    center = this.getCenterFromGeometry(entity),
                    centerCartographic = Cesium.Cartographic.fromCartesian(center),
                    longitude = centerCartographic.longitude,
                    latitude = centerCartographic.latitude,
                    targetHeight = height + 250;

                scene.camera.flyTo({
                    destination: Cesium.Cartesian3.fromRadians(longitude, latitude, targetHeight)
                });
            }
        },
        /**
         * Exports all drawn entities to single GeoJSON file.
         * @param {Event} event changed mouse position event
         * @returns {void}
         */
        exportToGeoJson () {
            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                drawnEntitiesCollection = [],
                jsonGlob = {
                    type: "FeatureCollection",
                    features: []
                },
                features = [];

            entities.values.forEach(entity => {
                if (!entity.model) {
                    drawnEntitiesCollection.push(entity);
                }
            });

            drawnEntitiesCollection.forEach(entity => {
                const geometry = entity.polygon ? entity.polygon : entity.polyline,
                    positions = entity.polygon ? entity.polygon.hierarchy.getValue().positions : entity.polyline.positions.getValue(),
                    color = geometry.material.color.getValue(),
                    outlineColor = geometry.outlineColor?.getValue(),
                    feature = {
                        type: "Feature",
                        properties: {},
                        geometry: {
                            type: entity.polygon ? "Polygon" : "Polyline",
                            coordinates: [[]]
                        }};

                positions.forEach(position => {
                    const cartographic = Cesium.Cartographic.fromCartesian(position),
                        longitude = Cesium.Math.toDegrees(cartographic.longitude),
                        latitude = Cesium.Math.toDegrees(cartographic.latitude),
                        altitude = entity.polygon ? geometry.height.getValue() : cartographic.height,
                        coordXY = [Number(longitude), Number(latitude), Number(altitude)];

                    feature.geometry.coordinates[0].push(coordXY);
                });

                feature.properties.name = entity.name;
                feature.properties.clampToGround = entity.clampToGround;
                feature.properties.color = color;

                if (entity.polygon) {
                    feature.properties.outlineColor = outlineColor;
                    feature.properties.extrudedHeight = geometry.extrudedHeight.getValue();
                }
                else if (entity.polyline) {
                    feature.properties.width = geometry.width.getValue();
                }

                features.push(feature);
            });

            jsonGlob.features = features;

            this.downloadGeoJson(JSON.stringify(jsonGlob));
        },
        /**
         * Downloads the exported GeoJSON file
         * @param {JSON} geojson - all entities in a json format.
         * @returns {void}
         */
        downloadGeoJson (geojson) {
            const url = URL.createObjectURL(new Blob([geojson], {type: "application/geo+json"})),
                link = document.createElement("a");

            link.href = url;
            link.download = "export.geojson";
            document.body.appendChild(link);
            link.click();
            URL.revokeObjectURL(url);
            document.body.removeChild(link);
        }
    }
};
</script>

<template lang="html">
    <div id="modeler3D-draw-tool">
        <p
            class="cta"
            v-html="$t('modules.tools.modeler3D.draw.captions.introInfo')"
        />
        <p
            class="cta"
            v-html="$t('modules.tools.modeler3D.draw.captions.controlInfo')"
        />
        <div class="h-seperator" />
        <div>
            <div class="form-check form-switch cta">
                <input
                    id="clampToGroundSwitch"
                    class="form-check-input"
                    type="checkbox"
                    role="switch"
                    :aria-checked="clampToGround"
                    :checked="clampToGround"
                    @change="clampToGround = !clampToGround; resetDrawing();"
                >
                <label
                    class="form-check-label"
                    for="clampToGroundSwitch"
                >
                    {{ $t("modules.tools.modeler3D.draw.captions.clampToGround") }}
                </label>
            </div>
            <div
                class="form-group form-group-sm row"
            >
                <label
                    class="col-md-5 col-form-label"
                    for="modeler3D-draw-name"
                >
                    {{ $t("modules.tools.modeler3D.draw.captions.drawName") }}
                </label>
                <div class="col-md-7">
                    <input
                        id="modeler3D-draw-name"
                        class="form-control form-control-sm"
                        type="text"
                        :value="drawName"
                        @input="setDrawName($event.target.value)"
                    >
                </div>
            </div>
        </div>
        <div class="d-flex flex-column">
            <label
                class="col-md-5 col-form-label"
                for="tool-modeler3d-draw-types"
            >
                {{ $t("modules.tools.modeler3D.draw.captions.geometry") }}
            </label>
            <DrawTypes
                id="tool-modeler3d-draw-types"
                :current-layout="currentLayout"
                :draw-types="drawTypes"
                :selected-draw-type="selectedDrawType"
                :selected-draw-type-main="selectedDrawTypeMain"
                :set-selected-draw-type="setSelectedDrawType"
                :set-selected-draw-type-main="setSelectedDrawTypeMain"
                @start-drawing="startDrawing"
                @stop-drawing="stopDrawing"
            />
        </div>
        <div
            v-if="selectedDrawType !== ''"
            class="d-flex flex-column flex-wrap"
        >
            <label
                class="col-md-5 col-form-label"
                for="tool-modeler3d-draw-types"
            >
                {{ $t("modules.tools.modeler3D.draw.captions.options") }}
            </label>
            <DrawLayout
                :current-layout="currentLayout"
                :selected-draw-type="selectedDrawType"
                @update-layout="resetDrawing"
            />
        </div>
        <EntityList
            v-if="drawnModels.length > 0"
            id="drawn-models"
            :objects="drawnModels"
            :objects-label="$t('modules.tools.modeler3D.draw.captions.drawnModels')"
            :entity="true"
            :geometry="true"
            @change-visibility="changeVisibility"
            @export-geojson="exportToGeoJson"
            @zoom-to="zoomTo"
        />
    </div>
</template>

<style lang="scss" scoped>
    @import "~/css/mixins.scss";
    @import "~variables";

    .cta {
        margin-bottom:12px;
    }

    .form-switch,
    .col-form-label {
        font-size: $font_size_big;
    }

    .form-check-input {
        cursor: pointer;
    }

    .h-seperator {
        margin:12px 0 12px 0;
        border: 1px solid #DDDDDD;
    }

    .primary-button-wrapper {
        color: $white;
        background-color: $secondary_focus;
        display: block;
        text-align:center;
        padding: 0.1rem 0.7rem;
        cursor: pointer;
        font-size: $font_size_big;
        &:focus {
            @include primary_action_focus;
        }
        &:hover {
            @include primary_action_hover;
        }
        &:disabled {
            background-color: $dark_grey;
            cursor: not-allowed;
        }
    }
</style>
