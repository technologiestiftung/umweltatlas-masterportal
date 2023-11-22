<script>
import BasicFileImport from "../../../../share-components/fileImport/components/BasicFileImport.vue";
import EntityList from "./ui/EntityList.vue";
import RoutingLoadingSpinner from "../../routing/components/RoutingLoadingSpinner.vue";
import {mapActions, mapGetters, mapMutations} from "vuex";
import actions from "../store/actionsModeler3D";
import getters from "../store/gettersModeler3D";
import mutations from "../store/mutationsModeler3D";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader.js";
import {ColladaLoader} from "three/examples/jsm/loaders/ColladaLoader.js";
import {GLTFExporter} from "three/examples/jsm/exporters/GLTFExporter.js";
import store from "../../../../app-store";

export default {
    name: "Modeler3DImport",
    components: {
        BasicFileImport,
        EntityList,
        RoutingLoadingSpinner
    },
    emits: ["moveEntity"],
    computed: {
        ...mapGetters(["namedProjections"]),
        ...mapGetters("Tools/Modeler3D", Object.keys(getters))
    },
    methods: {
        ...mapActions("Tools/Modeler3D", Object.keys(actions)),
        ...mapMutations("Tools/Modeler3D", Object.keys(mutations)),
        /**
         * Adds and processes the selected file.
         * @param {FileList} files - The selected files.
         * @returns {void}
         */
        addFile (files) {
            const reader = new FileReader(),
                file = files[0],
                fileName = file.name.split(".")[0],
                fileExtension = file.name.split(".").pop(),
                fileSizeMB = file.size / (1024 * 1024),
                maxFileSizeMB = 100;

            if (fileSizeMB > maxFileSizeMB) {
                store.dispatch("Alerting/addSingleAlert", i18next.t("common:modules.tools.modeler3D.import.alertingMessages.fileSizeError"), {root: true});
                return;
            }

            if (fileExtension === "gltf") {
                this.handleGltfFile(file, fileName);
                return;
            }

            this.setIsLoading(true);

            reader.onload = (event) => {
                if (fileExtension === "obj") {
                    this.handleObjFile(event.target.result, fileName);
                }
                else if (fileExtension === "dae") {
                    this.handleDaeFile(event.target.result, fileName);
                }
                else if (fileExtension === "geojson") {
                    this.handleGeoJsonFile(event.target.result);
                }
                else {
                    store.dispatch("Alerting/addSingleAlert", {content: i18next.t("common:modules.tools.modeler3D.import.alertingMessages.missingFormat", {format: fileExtension})}, {root: true});
                    this.setIsLoading(false);
                }
            };

            reader.onerror = (e) => {
                console.error("Error reading the file:", e.target.error);
                this.setIsLoading(false);
            };

            if (fileExtension === "dae") {
                reader.readAsDataURL(file);
            }
            else {
                reader.readAsText(file);
            }
        },
        /**
         * Handles the processing of GLTF content.
         * @param {Blob} blob - The GLTF content.
         * @param {String} fileName - The name of the file.
         * @returns {void}
         */
        handleGltfFile (blob, fileName) {
            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                lastElement = entities.values.slice().pop(),
                lastId = lastElement?.id,
                models = this.importedModels,
                entity = new Cesium.Entity({
                    id: lastId ? lastId + 1 : 1,
                    name: fileName,
                    clampToGround: true,
                    model: {
                        uri: URL.createObjectURL(blob)
                    }
                });

            this.setCurrentModelId(entity.id);
            this.$emit("emit-move");

            entities.add(entity);

            models.push({
                id: entity.id,
                name: fileName,
                show: true,
                edit: false,
                heading: 0
            });
            this.setImportedModels(models);
            this.setIsLoading(false);
        },
        /**
         * Handles the processing of OBJ content.
         * @param {String} content - The OBJ content.
         * @param {String} fileName - The name of the file.
         * @returns {void}
         */
        handleObjFile (content, fileName) {
            const objLoader = new OBJLoader(),
                objData = objLoader.parse(content),
                gltfExporter = new GLTFExporter();

            gltfExporter.parse(objData, (gltfData) => {
                const gltfJson = JSON.stringify(gltfData),
                    blob = new Blob([gltfJson], {type: "model/gltf+json"});

                this.handleGltfFile(blob, fileName);
            });
        },
        /**
         * Handles the processing of a DAE file.
         * @param {String} content - The DAE content.
         * @param {String} fileName - The name of the file.
         * @returns {void}
         */
        handleDaeFile (content, fileName) {
            const colladaLoader = new ColladaLoader();

            colladaLoader.load(content, (collada) => {
                const exporter = new GLTFExporter();

                exporter.parse(collada.scene, (gltfData) => {
                    const gltfLoader = new GLTFLoader();

                    gltfLoader.parse(gltfData, "", () => {
                        const gltfJson = JSON.stringify(gltfData),
                            blob = new Blob([gltfJson], {type: "model/gltf+json"});

                        this.handleGltfFile(blob, fileName);
                    });
                });
            });
        },
        /**
         * Handles the processing of GeoJSON content.
         * @param {String} content - The GeoJSON content.
         * @param {String} fileName - The name of the file.
         * @returns {void}
         */
        handleGeoJsonFile (content) {
            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                geojson = JSON.parse(content);

            geojson.features.forEach(feature => {
                const properties = feature.properties,
                    color = properties.color,
                    outlineColor = properties.outlineColor,
                    coordinates = feature.geometry.coordinates[0],
                    lastElement = entities.values.slice().pop(),
                    lastId = lastElement?.id,
                    entity = new Cesium.Entity({
                        id: lastId ? lastId + 1 : 1,
                        name: properties.name,
                        wasDrawn: true,
                        clampToGround: properties.clampToGround
                    });

                if (feature.geometry.type === "Polygon") {
                    entity.polygon = {
                        material: new Cesium.ColorMaterialProperty(
                            new Cesium.Color(color.red, color.green, color.blue, color.alpha)
                        ),
                        outline: true,
                        outlineColor: new Cesium.Color(outlineColor.red, outlineColor.green, outlineColor.blue, outlineColor.alpha),
                        outlineWidth: 1,
                        height: coordinates[0][2],
                        extrudedHeight: properties.extrudedHeight,
                        shadows: Cesium.ShadowMode.ENABLED,
                        hierarchy: new Cesium.PolygonHierarchy(coordinates.map(point => Cesium.Cartesian3.fromDegrees(point[0], point[1])))
                    };
                }
                else if (feature.geometry.type === "Polyline") {
                    entity.polyline = {
                        material: new Cesium.ColorMaterialProperty(
                            new Cesium.Color(color.red, color.green, color.blue, color.alpha)
                        ),
                        width: properties.width,
                        positions: coordinates.map(point => Cesium.Cartesian3.fromDegrees(point[0], point[1], point[2]))
                    };
                }

                entities.add(entity);
                this.drawnModels.push({
                    id: entity.id,
                    name: entity.name,
                    show: true,
                    edit: false
                });
            });

            this.setCurrentView("draw");
            this.setIsLoading(false);
        },
        /**
         * Toggles the visibility of a model entity.
         * @param {object} model - The model object.
         * @returns {void}
         */
        changeVisibility (model) {
            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                entity = entities.getById(model.id);

            entity.show = !model.show;
            model.show = entity.show;
        },
        /**
         * Zooms the camera to the specified entity.
         * @param {string} id - The ID of the entity to zoom to.
         * @returns {void}
         */
        zoomTo (id) {
            const scene = mapCollection.getMap("3D").getCesiumScene(),
                entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                entity = entities.getById(id),
                entityPosition = entity.position.getValue(),
                destination = Cesium.Cartographic.fromCartesian(entityPosition);

            scene.camera.flyTo({
                destination: Cesium.Cartesian3.fromRadians(destination.longitude, destination.latitude, destination.height + 250)
            });
        }
    }
};
</script>

<template lang="html">
    <RoutingLoadingSpinner
        v-if="isLoading"
    />
    <div
        v-else
        id="modeler3D-import-view"
    >
        <BasicFileImport
            :intro-formats="$t('modules.tools.modeler3D.import.captions.introFormats')"
            @add-file="addFile"
        >
            <p
                class="cta"
                v-html="$t('modules.tools.modeler3D.import.captions.introInfo')"
            />
            <p
                class="cta"
                v-html="$t('modules.tools.modeler3D.import.captions.introInfo2')"
            />
        </BasicFileImport>

        <EntityList
            v-if="importedModels?.length > 0"
            id="successfully-imported-models"
            :objects="importedModels"
            :objects-label="$t('modules.tools.modeler3D.import.captions.successfullyImportedLabel')"
            :entity="true"
            @change-visibility="changeVisibility"
            @zoom-to="zoomTo"
        />
    </div>
</template>

<style lang="scss" scoped>
    @import "~/css/mixins.scss";
    @import "~variables";

    .spinner {
        width: 50px;
        height: 50px;
        margin-top: -25px;
        margin-left: -25px;
        left: 50%;
        top: 50%;
        position: absolute;
        background: rgba(0, 0, 0, 0);
    }

    .h-seperator {
        margin:12px 0 12px 0;
        border: 1px solid #DDDDDD;
    }
</style>
