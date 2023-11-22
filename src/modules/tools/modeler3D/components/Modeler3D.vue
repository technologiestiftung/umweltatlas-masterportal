<script>
import ToolTemplate from "../../ToolTemplate.vue";
import EntityModel from "./Modeler3DEntityModel.vue";
import Import from "./Modeler3DImport.vue";
import Draw from "./Modeler3DDraw.vue";
import EntityList from "./ui/EntityList.vue";
import {getComponent} from "../../../../utils/getComponent";
import {mapActions, mapGetters, mapMutations} from "vuex";
import actions from "../store/actionsModeler3D";
import getters from "../store/gettersModeler3D";
import mutations from "../store/mutationsModeler3D";
import crs from "@masterportal/masterportalapi/src/crs";
import getGfiFeatures from "../../../../api/gfi/getGfiFeaturesByTileFeature";
import {adaptCylinderToGround, adaptCylinderToEntity, adaptCylinderUnclamped} from "../utils/draw";

let eventHandler = null;

export default {
    name: "Modeler3D",
    components: {
        ToolTemplate,
        EntityModel,
        Import,
        Draw,
        EntityList
    },
    data () {
        return {
            defaultTabClass: "",
            currentPosition: null,
            activeTabClass: "active",
            currentCartesian: null,
            originalCursorStyle: null
        };
    },
    computed: {
        ...mapGetters(["namedProjections"]),
        ...mapGetters("Tools/Modeler3D", Object.keys(getters)),
        ...mapGetters("Maps", ["altitude", "longitude", "latitude", "clickCoordinate", "mouseCoordinate"]),
        /**
         * Returns the CSS classes for the import tab based on the current view.
         * @returns {string} - The CSS classes for the import tab.
         */
        importTabClasses () {
            return this.currentView === "import" ? this.activeTabClass : this.defaultTabClass;
        },
        /**
         * Returns the CSS classes for the draw tab based on the current view.
         * @returns {string} - The CSS classes for the draw tab.
         */
        drawTabClasses () {
            return this.currentView === "draw" ? this.activeTabClass : this.defaultTabClass;
        },
        /**
         * Returns the CSS classes for the options tab based on the current view.
         * @returns {string} - The CSS classes for the options tab.
         */
        optionsTabClasses () {
            return this.currentView === "" ? this.activeTabClass : this.defaultTabClass;
        },
        /**
         * Checks if it is possible to enter point of view (POV) mode.
         * Returns true if `longitude`, `latitude`, and `altitude` properties are defined and truthy, otherwise false.
         * @returns {boolean} - Indicates whether POV mode is possible.
         */
        povPossible () {
            return Boolean(this.longitude && this.latitude && this.altitude);
        }
    },
    watch: {
        /**
         * Listens to the active property change.
         * @param {Boolean} isActive Value deciding whether the tool gets activated or deactivated.
         * @returns {void}
         */
        active (isActive) {
            if (isActive) {
                const scene = mapCollection.getMap("3D").getCesiumScene();

                this.initProjections();
                eventHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);

                eventHandler.setInputAction(this.selectObject, Cesium.ScreenSpaceEventType.LEFT_CLICK);
                eventHandler.setInputAction(this.moveEntity, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
                eventHandler.setInputAction(this.cursorCheck, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            }
            else {
                eventHandler.destroy();
            }
        },
        /**
         * Updates the current model ID and performs corresponding actions.
         * @param {string} newId - The ID of the new model.
         * @param {string} oldId - The ID of the old model.
         * @returns {void}
         */
        currentModelId (newId, oldId) {
            if (!this.isDrawing) {
                const scene = mapCollection.getMap("3D").getCesiumScene(),
                    entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                    newEntity = entities.getById(newId),
                    oldEntity = entities.getById(oldId);

                if (oldEntity) {
                    if (oldEntity.wasDrawn) {
                        if (oldEntity.polygon) {
                            oldEntity.polygon.material.color = oldEntity.originalColor;
                            oldEntity.polygon.outlineColor = oldEntity.originalOutlineColor;
                            oldEntity.polygon.hierarchy = new Cesium.ConstantProperty(new Cesium.PolygonHierarchy(this.activeShapePoints));
                            this.setExtrudedHeight(20);
                        }
                        else if (oldEntity.polyline) {
                            oldEntity.polyline.positions = new Cesium.ConstantProperty(this.activeShapePoints);
                            oldEntity.polyline.material.color = oldEntity.originalColor;
                        }
                        this.removeCylinders();
                        this.setActiveShapePoints([]);
                        this.setCylinderId(null);
                    }
                    else {
                        oldEntity.model.color = Cesium.Color.WHITE;
                        oldEntity.model.silhouetteColor = null;
                        oldEntity.model.silhouetteSize = 0;
                        oldEntity.model.colorBlendAmount = 0;
                    }
                    scene.requestRender();

                    this.setCurrentModelPosition(null);
                }
                if (newEntity) {
                    if (newEntity.wasDrawn) {
                        if (newEntity.polygon) {
                            this.generateCylinders();
                            this.setActiveShapePoints(newEntity.polygon.hierarchy.getValue().positions);
                            newEntity.polygon.hierarchy = new Cesium.CallbackProperty(() => new Cesium.PolygonHierarchy(this.activeShapePoints), false);
                        }
                        else if (newEntity.polyline) {
                            this.generateCylinders();
                            this.setActiveShapePoints(newEntity.polyline.positions.getValue());
                            newEntity.polyline.positions = new Cesium.CallbackProperty(() => this.activeShapePoints);
                        }
                    }
                    this.highlightEntity(newEntity);
                    this.setCurrentModelPosition(newEntity?.position?.getValue() || this.getCenterFromGeometry(newEntity));
                    this.updateUI();
                }
            }
        }
    },
    created () {
        this.$on("close", this.close);
    },
    methods: {
        ...mapActions("Tools/Modeler3D", Object.keys(actions)),
        ...mapMutations("Tools/Modeler3D", Object.keys(mutations)),
        ...mapMutations("Tools/Gfi", {setGfiActive: "setActive"}),

        /**
         * Initializes the projections to select. If projection EPSG:4326 is available same is added in decimal-degree.
         * @returns {void}
         */
        initProjections () {
            const pr = crs.getProjections(),
                epsg8395 = [],
                wgs84Proj = [];

            if (this.projections.length) {
                return;
            }
            // id is set to the name and in case of decimal "-DG" is appended to name later on
            // for use in select-box
            pr.forEach(proj => {
                proj.id = proj.name;
                if (proj.name === "EPSG:4326" || proj.name === "http://www.opengis.net/gml/srs/epsg.xml#4326") {
                    wgs84Proj.push(proj);
                }
                if (proj.name === "EPSG:8395" || proj.name === "http://www.opengis.net/gml/srs/epsg.xml#8395") {
                    epsg8395.push(proj);
                }
                if (proj.name.indexOf("#") > -1) { // e.g. "http://www.opengis.net/gml/srs/epsg.xml#25832"
                    const code = proj.name.substring(proj.name.indexOf("#") + 1, proj.name.length);

                    proj.epsg = "EPSG:" + code;
                }
                else {
                    proj.title = proj.name;
                }
                if (proj.id === this.currentProjection.id) {
                    this.setCurrentProjection(proj);
                }
            });
            if (wgs84Proj.length > 0) {
                this.addWGS84Decimal(pr, wgs84Proj);
            }
            this.namedProjections.find((el) => {
                if (el[1].includes("ETRS89_3GK3") && epsg8395.length > 0) {
                    this.addETRS893GK3(pr, el, epsg8395);
                    return true;
                }
                return false;
            });
            this.setProjections(pr);
        },
        /**
         * Adds EPSG:4326 in decimal-degree to list of projections.
         * @param {Array} projections list of all available projections
         * @param {Object} elementETRS89_3GK3 the WGS84 projection contained in list of projections
         * @param {Object} epsg8395 the WGS84 projection contained in list of projections
         * @returns {void}
         */
        addETRS893GK3 (projections, elementETRS89_3GK3, epsg8395) {
            const index = projections.findIndex(proj => proj.name === "EPSG:8395"),
                etrs89_3GK3Proj = {};

            for (const key in epsg8395[0]) {
                etrs89_3GK3Proj[key] = epsg8395[0][key];
            }
            etrs89_3GK3Proj.name = "ETRS893GK3";
            etrs89_3GK3Proj.epsg = "EPSG:8395";
            etrs89_3GK3Proj.id = "http://www.opengis.net/gml/srs/epsg.xml#ETRS893GK3";
            etrs89_3GK3Proj.title = elementETRS89_3GK3[1].substring(elementETRS89_3GK3[1].lastIndexOf("ETRS"), elementETRS89_3GK3[1].indexOf(" +proj="));
            etrs89_3GK3Proj.getCode = () => "noEPSGCode";
            projections.splice(index + 1, 0, etrs89_3GK3Proj);
        },
        /**
         * Adds EPSG:4326 in decimal-degree to list of projections.
         * @param {Array} projections list of all available projections
         * @param {Object} wgs84Proj the WGS84 projection contained in list of projections
         * @returns {void}
         */
        addWGS84Decimal (projections, wgs84Proj) {
            const index = projections.findIndex(proj => proj.name === "EPSG:4326"),
                wgs84ProjDez = {};

            for (const key in wgs84Proj[0]) {
                wgs84ProjDez[key] = wgs84Proj[0][key];
            }
            wgs84ProjDez.name = "EPSG:4326-DG";
            wgs84ProjDez.epsg = "EPSG:4326";
            wgs84ProjDez.id = "http://www.opengis.net/gml/srs/epsg.xml#4326-DG";
            wgs84ProjDez.title = "WGS84_Lat-Lon (Grad, Dezimal), EPSG 4326";
            wgs84ProjDez.getCode = () => "EPSG:4326-DG";
            projections.splice(index + 1, 0, wgs84ProjDez);
        },
        /**
         * Checks the map for pickable Cesium objects and changes the cursor on hover.
         * @param {Event} event - The event object containing the position information.
         * @returns {void}
         */
        cursorCheck (event) {
            if (this.isDrawing) {
                return;
            }
            const scene = mapCollection.getMap("3D").getCesiumScene(),
                picked = scene.pick(event.endPosition),
                entity = Cesium.defaultValue(picked?.id, picked?.primitive?.id);

            if (Cesium.defined(entity) && entity instanceof Cesium.Entity) {
                if (this.currentModelId && entity.id === this.currentModelId || entity.cylinder) {
                    document.body.style.cursor = "grab";
                }
                else {
                    document.body.style.cursor = "pointer";
                }
            }
            else if (this.hideObjects && Cesium.defined(picked) && picked instanceof Cesium.Cesium3DTileFeature) {
                document.body.style.cursor = "pointer";
            }
            else {
                document.body.style.cursor = "auto";
            }
        },
        /**
         * Initiates the process of moving an entity.
         * @param {Event} event - The event object containing the position information.
         * @returns {void}
         */
        moveEntity (event) {
            if (this.isDrawing) {
                return;
            }

            let entity;

            if (event) {
                const scene = mapCollection.getMap("3D").getCesiumScene(),
                    picked = scene.pick(event.position);

                entity = Cesium.defaultValue(picked?.id, picked?.primitive?.id);
            }

            if (entity instanceof Cesium.Entity || !event) {
                const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities;

                this.setIsDragging(true);
                this.originalHideOption = this.hideObjects;
                this.setHideObjects(false);

                document.body.style.cursor = "grabbing";

                if (entity?.cylinder) {
                    const geometry = entities.getById(this.currentModelId),
                        position = geometry.polygon ? geometry.polygon.hierarchy.getValue().positions[entity.positionIndex] : geometry.polyline.positions.getValue()[entity.positionIndex];

                    this.currentPosition = position;

                    entity.position = geometry.clampToGround ?
                        new Cesium.CallbackProperty(() => adaptCylinderToGround(entity, this.currentPosition), false) :
                        new Cesium.CallbackProperty(() => adaptCylinderToEntity(geometry, entity, this.currentPosition), false);
                    eventHandler.setInputAction(this.moveCylinder, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                }
                else {
                    entities.values.filter(ent => ent.cylinder).forEach((cyl, index) => {
                        this.cylinderPosition[index] = cyl.position.getValue();

                        cyl.position = entity.clampToGround ?
                            new Cesium.CallbackProperty(() => adaptCylinderToGround(cyl, this.cylinderPosition[index]), false) :
                            new Cesium.CallbackProperty(() => adaptCylinderToEntity(entity, cyl, this.cylinderPosition[index]), false);
                    });

                    eventHandler.setInputAction(this.onMouseMove, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                }
                eventHandler.setInputAction(this.onMouseUp, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
            }
        },
        /**
         * Selects an object based on the provided event.
         * @param {Event} event - The event object containing the position information.
         * @returns {void}
         */
        selectObject (event) {
            if (this.isDrawing) {
                return;
            }
            const scene = mapCollection.getMap("3D").getCesiumScene(),
                picked = scene.pick(event.position);

            if (Cesium.defined(picked)) {
                const entity = Cesium.defaultValue(picked?.id, picked?.primitive?.id);

                if (entity instanceof Cesium.Entity) {
                    if (entity.cylinder) {
                        this.setCylinderId(entity.id);
                    }
                    else {
                        this.setCurrentModelId(entity.id);
                        this.setCylinderId(null);
                    }
                }
                else if (this.hideObjects && picked instanceof Cesium.Cesium3DTileFeature) {
                    const features = getGfiFeatures.getGfiFeaturesByTileFeature(picked),
                        gmlId = features[0]?.getProperties()[this.gmlIdPath],
                        tileSetModels = this.updateAllLayers ?
                            Radio.request("ModelList", "getModelsByAttributes", {typ: "TileSet3D"}) :
                            Radio.request("ModelList", "getModelsByAttributes", {typ: "TileSet3D", id: picked.tileset.layerReferenceId});

                    tileSetModels.forEach(model => model.hideObjects([gmlId], this.updateAllLayers));

                    this.hiddenObjects.push({
                        name: gmlId
                    });
                }
            }
        },
        /**
         * Handles the mouse move event and performs actions when dragging a cylinder.
         * @param {Event} event - The event object containing the position information.
         * @returns {void}
         */
        moveCylinder (event) {
            if (!this.isDragging || this.isDrawing) {
                return;
            }

            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                entity = entities.getById(this.currentModelId),
                cylinder = entities.getById(this.cylinderId);

            if (Cesium.defined(cylinder) && Cesium.defined(entity)) {
                const scene = mapCollection.getMap("3D").getCesiumScene();

                if (entity.clampToGround) {
                    const ray = scene.camera.getPickRay(event.endPosition),
                        position = scene.globe.pick(ray, scene);

                    if (this.currentPosition !== position) {
                        this.currentPosition = scene.globe.pick(ray, scene);
                        this.updatePositionUI();
                    }
                }
                else {
                    const transformedCoordinates = crs.transformFromMapProjection(mapCollection.getMap("3D").getOlMap(), "EPSG:4326", [this.mouseCoordinate[0], this.mouseCoordinate[1]]),
                        cartographic = Cesium.Cartographic.fromDegrees(transformedCoordinates[0], transformedCoordinates[1]);

                    cartographic.height = scene.sampleHeight(cartographic, [cylinder, entity]);

                    if (this.currentPosition !== Cesium.Cartographic.toCartesian(cartographic)) {
                        this.currentPosition = Cesium.Cartographic.toCartesian(cartographic);
                        this.updatePositionUI();
                    }
                }
                if (Cesium.defined(this.currentPosition)) {
                    this.activeShapePoints.splice(cylinder.positionIndex, 1, this.currentPosition);
                }
            }
        },
        /**
         * Handles the mouse move event and performs actions when dragging an object.
         * @param {Event} event - The event object containing the position information.
         * @returns {void}
         */
        onMouseMove (event) {
            if (!this.isDragging) {
                return;
            }

            const scene = mapCollection.getMap("3D").getCesiumScene(),
                ray = scene.camera.getPickRay(event.endPosition),
                position = scene.globe.pick(ray, scene),
                entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                entity = entities.getById(this.currentModelId);

            if (!Cesium.defined(position) || !Cesium.defined(entity)) {
                return;
            }

            if (entity.polygon) {
                this.movePolygon({entityId: this.currentModelId, position});
            }
            else if (entity.polyline) {
                this.movePolyline({entityId: this.currentModelId, position});
            }
            else {
                entity.position = position;
            }
            this.updatePositionUI();
        },
        /**
         * Handles the mouse up event and performs actions when the dragging of an object is finished.
         * @returns {void}
         */
        onMouseUp () {
            if (!this.isDragging) {
                return;
            }
            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities;

            this.removeInputActions();
            this.setIsDragging(false);

            if (this.cylinderId) {
                const cylinder = entities.getById(this.cylinderId),
                    entity = entities.getById(this.currentModelId);

                cylinder.position = entity?.clampToGround ?
                    adaptCylinderToGround(cylinder, cylinder.position.getValue()) :
                    adaptCylinderToEntity(entity, cylinder, cylinder.position.getValue());
                this.setCylinderId(null);
            }
            else if (this.wasDrawn) {
                const cylinders = entities.values.filter(ent => ent.cylinder),
                    entity = entities.getById(this.currentModelId);

                cylinders.forEach((cyl) => {
                    cyl.position = entity?.clampToGround ?
                        adaptCylinderToGround(cyl, cyl.position.getValue()) :
                        adaptCylinderToEntity(entity, cyl, cyl.position.getValue());
                });
            }
            this.setHideObjects(this.originalHideOption);

            document.body.style.cursor = "auto";
        },
        /**
         * Removes the input actions related to mouse move and left double click events.
         * @returns {void}
         */
        removeInputActions () {
            if (eventHandler) {
                eventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                eventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
                eventHandler.setInputAction(this.cursorCheck, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                eventHandler.setInputAction(this.moveEntity, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
            }
        },
        /**
         * Highlights the specified entity by applying the configured or default highlight style.
         * @param {Cesium.Entity} entity - The entity to highlight.
         * @returns {void}
         */
        highlightEntity (entity) {
            const color = this.highlightStyle.color,
                alpha = this.highlightStyle.alpha,
                silhouetteColor = this.highlightStyle.silhouetteColor,
                silhouetteSize = this.highlightStyle.silhouetteSize;

            if (entity.wasDrawn) {
                if (entity.polygon) {
                    entity.originalColor = entity.polygon.material.color;
                    entity.originalOutlineColor = entity.polygon.outlineColor;
                    entity.polygon.material.color = Cesium.Color.fromAlpha(
                        Cesium.Color.fromCssColorString(color),
                        parseFloat(alpha)
                    );
                    entity.polygon.outline = true;
                    entity.polygon.outlineColor = Cesium.Color.fromCssColorString(silhouetteColor);
                }
                else if (entity.polyline) {
                    entity.originalColor = entity.polyline.material.color;
                    entity.polyline.material.color = Cesium.Color.fromAlpha(
                        Cesium.Color.fromCssColorString(color),
                        parseFloat(alpha)
                    );
                }
            }
            else {
                entity.model.color = Cesium.Color.fromAlpha(
                    Cesium.Color.fromCssColorString(color),
                    parseFloat(alpha)
                );
                entity.model.silhouetteColor = Cesium.Color.fromCssColorString(silhouetteColor);
                entity.model.silhouetteSize = parseFloat(silhouetteSize);
                entity.model.colorBlendMode = Cesium.ColorBlendMode.HIGHLIGHT;
            }
        },
        /**
         * Shows the specified object by making it visible in the scene.
         * @param {Object} object - The object to show.
         * @returns {void}
         */
        showObject (object) {
            const objectIndex = this.hiddenObjects.findIndex(x => x.name === object.name),
                tileSetModels = Radio.request("ModelList", "getModelsByAttributes", {typ: "TileSet3D"});

            tileSetModels[0].showObjects([object.name]);
            this.hiddenObjects.splice(objectIndex, 1);
        },
        close () {
            this.setActive(false);
            const model = getComponent(this.id);

            if (model) {
                model.set("isActive", false);
            }
        },
        /**
         * Positions the camera in the point of view of a pedestrian at the clicked position.
         * @returns {void}
         */
        positionPovCamera () {
            const scene = mapCollection.getMap("3D").getCesiumScene(),
                transformedCoordinates = crs.transformFromMapProjection(mapCollection.getMap("3D").getOlMap(), "EPSG:4326", this.clickCoordinate),
                currentPosition = scene.camera.positionCartographic,
                destination = new Cesium.Cartographic(
                    Cesium.Math.toRadians(transformedCoordinates[0]),
                    Cesium.Math.toRadians(transformedCoordinates[1])
                );

            this.originalCursorStyle = document.body.style.cursor;
            this.currentCartesian = Cesium.Cartographic.toCartesian(currentPosition);
            destination.height = this.altitude + 1.80;

            scene.camera.flyTo({
                destination: Cesium.Cartesian3.fromRadians(destination.longitude, destination.latitude, destination.height),
                orientation: {
                    pitch: 0,
                    roll: 0,
                    heading: scene.camera.heading
                },
                complete: () => {
                    document.body.style.cursor = "none";
                }
            });
            eventHandler.setInputAction((movement) => {
                const deltaY = -movement.endPosition.y + movement.startPosition.y,
                    deltaX = movement.endPosition.x - movement.startPosition.x,

                    sensitivity = 0.002,
                    pitch = Cesium.Math.clamp(scene.camera.pitch + sensitivity * deltaY, -Cesium.Math.PI_OVER_TWO, Cesium.Math.PI_OVER_TWO),
                    heading = scene.camera.heading + sensitivity * deltaX;

                scene.camera.setView({
                    orientation: {
                        pitch: pitch,
                        roll: 0,
                        heading: heading
                    }
                });
            }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            scene.screenSpaceCameraController.enableZoom = false;
            scene.screenSpaceCameraController.enableRotate = false;
            document.addEventListener("keydown", this.escapeKeyHandler);
        },
        /**
         * Handles the Escape key press to reset the camera perspective.
         * @param {KeyboardEvent} e - The event object for the keyboard event.
         * @returns {void}
         */
        escapeKeyHandler (e) {
            const scene = mapCollection.getMap("3D").getCesiumScene();

            if (e.code === "Escape") {
                scene.camera.flyTo({
                    destination: this.currentCartesian,
                    complete: () => {
                        scene.screenSpaceCameraController.enableZoom = true;
                        scene.screenSpaceCameraController.enableRotate = true;

                        eventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                        document.removeEventListener("keydown", this.escapeKeyHandler);
                        document.body.style.cursor = this.originalCursorStyle;
                        this.changeCursor();
                    }
                });
            }
        },
        resetPov () {
            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities;

            this.setPovActive(false);
            entities.removeById(this.cylinderId);
            document.body.style.cursor = this.originalCursorStyle;
            eventHandler.setInputAction(this.selectObject, Cesium.ScreenSpaceEventType.LEFT_CLICK);
            eventHandler.setInputAction(this.cursorCheck, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        },
        /**
         * Toggles the active state of a switch and performs related actions.
         * If the provided ID is "povActiveSwitch" or the current state of `this.povActive` is true,
         * it removes an entity by ID, resets the cursor style, and toggles `this.povActive`.
         * Finally, it updates the cursor style and toggles the visibility of objects.
         *
         * @param {string} id - The ID of the switch.
         * @returns {void}
         */
        changeSwitches (id) {
            if (id === "povActiveSwitch") {
                if (this.povActive) {
                    this.resetPov();
                }
                else {
                    this.setPovActive(true);
                    this.setHideObjects(false);
                    eventHandler.setInputAction(this.cursorCheck, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                }
            }
            else if (id === "hideObjectsSwitch" || this.hideObjects) {
                this.setHideObjects(!this.hideObjects);
                this.resetPov();
                // document.body.style.cursor = this.originalCursorStyle;
            }

        },
        /**
         * Event handler for click events.
         * Updates the cursor style, removes the MOUSE_MOVE input action, and adds the selectObject function as the LEFT_CLICK input action.
         * @returns {void}
         */
        clickHandler () {
            document.body.style.cursor = this.originalCursorStyle;
            eventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            eventHandler.setInputAction(this.selectObject, Cesium.ScreenSpaceEventType.LEFT_CLICK);
            this.positionPovCamera();
        },
        /**
         * Event handler for move events.
         * Transforms the mouse coordinates, retrieves the povCylinder by ID,
         * updates the cursor style, samples the height at the transformed coordinates,
         * and updates the currentCartesian position if it has changed.
         * @returns {void}
         */
        moveHandler () {
            if (!this.mouseCoordinate) {
                return;
            }

            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
                transformedCoordinates = crs.transformFromMapProjection(mapCollection.getMap("3D").getOlMap(), "EPSG:4326", [this.mouseCoordinate[0], this.mouseCoordinate[1]]),
                cartographic = Cesium.Cartographic.fromDegrees(transformedCoordinates[0], transformedCoordinates[1]),
                povCylinder = entities.getById(this.cylinderId);
            let currentCartesian;

            if (cartographic) {
                const scene = mapCollection.getMap("3D").getCesiumScene();

                cartographic.height = scene.sampleHeight(cartographic, [povCylinder]);
                currentCartesian = Cesium.Cartographic.toCartesian(cartographic);

                document.body.style.cursor = "copy";
            }

            if (!Cesium.Cartesian3.equals(this.currentCartesian, currentCartesian)) {
                this.currentCartesian = currentCartesian;
            }
        },
        /**
         * Changes the cursor and sets input actions based on the state of `this.povActive`.
         * If `this.povActive` is true, it retrieves the povCylinder by ID and performs the following actions:
         * - If the povCylinder doesn't exist, it creates a cylinder, sets its position, and assigns it to povCylinder.
         * - It sets the moveHandler function as the input action for MOUSE_MOVE events.
         * - It sets the clickHandler function as the input action for LEFT_CLICK events.
         * @returns {void}
         */
        changeCursor () {
            if (!this.povActive) {
                return;
            }

            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities;
            let povCylinder = entities.getById(this.cylinderId);

            if (!povCylinder) {
                const payload = {
                    posIndex: 0,
                    length: 10
                };

                this.createCylinder(payload);
                povCylinder = entities.getById(this.cylinderId);
                povCylinder.position = new Cesium.CallbackProperty(() => adaptCylinderUnclamped(povCylinder, this.currentCartesian), false);
            }
            eventHandler.setInputAction(this.moveHandler, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            eventHandler.setInputAction(this.clickHandler, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        }
    }
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
        :initial-width="380"
    >
        <template #toolBody>
            <div
                v-if="active"
                id="tool-modeler3D"
            >
                <EntityModel
                    v-if="currentModelId"
                />
                <div v-else>
                    <ul class="nav nav-tabs">
                        <li
                            id="tool-modeler3D-import"
                            role="presentation"
                            class="nav-item"
                        >
                            <a
                                href="#"
                                class="nav-link"
                                :class="[importTabClasses, {'disabled': isDrawing}]"
                                @click.prevent="setCurrentView('import'), resetPov()"
                            >{{ $t("modules.tools.modeler3D.nav.importTitle") }}</a>
                        </li>
                        <li
                            id="tool-modeler3D-draw"
                            role="presentation"
                            class="nav-item"
                        >
                            <a
                                href="#"
                                class="nav-link"
                                :class="[drawTabClasses, {'disabled': isDrawing}]"
                                @click.prevent="setCurrentView('draw'), resetPov()"
                            >{{ $t("modules.tools.modeler3D.nav.drawTitle") }}</a>
                        </li>
                        <li
                            id="tool-modeler3D-options"
                            role="presentation"
                            class="nav-item"
                        >
                            <a
                                href="#"
                                class="nav-link"
                                :class="[optionsTabClasses, {'disabled': isDrawing}]"
                                @click.prevent="setCurrentView(''), resetPov()"
                            >{{ $t("modules.tools.modeler3D.nav.options") }}</a>
                        </li>
                    </ul>
                    <component
                        :is="currentView"
                        v-if="currentView"
                        @emit-move="moveEntity"
                    />
                    <div
                        v-if="!currentView"
                        id="modeler3D-options-view"
                        class="accordion"
                    >
                        <div class="accordion-item">
                            <h1
                                id="options-headingOne"
                                class="accordion-header"
                            >
                                <button
                                    class="accordion-button"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target="#options-collapseOne"
                                    aria-expanded="true"
                                    aria-controls="options-collapseOne"
                                >
                                    {{ $t("modules.tools.modeler3D.options.captions.visibilityTitle") }}
                                </button>
                            </h1>
                            <div
                                id="options-collapseOne"
                                class="accordion-collapse collapse show"
                                aria-labelledby="options-headingOne"
                            >
                                <div class="accordion-body">
                                    <h2 v-html="$t('modules.tools.modeler3D.options.captions.hideSwitchLabel')" />
                                    <div class="form-check form-switch cta">
                                        <input
                                            id="hideObjectsSwitch"
                                            class="form-check-input"
                                            type="checkbox"
                                            role="switch"
                                            :aria-checked="hideObjects"
                                            :checked="hideObjects"
                                            @change="changeSwitches('hideObjectsSwitch')"
                                        >
                                        <label
                                            class="form-check-label"
                                            for="hideObjectsSwitch"
                                        >
                                            {{ $t("modules.tools.modeler3D.options.captions.enableFunction") }}
                                        </label>
                                    </div>
                                    <p
                                        class="cta"
                                        v-html="$t('modules.tools.modeler3D.options.captions.hideObjectInfo')"
                                    />
                                    <div class="h-seperator" />
                                    <h2 v-html="$t('modules.tools.modeler3D.options.captions.povTitle')" />
                                    <div>
                                        <div class="form-check form-switch cta">
                                            <input
                                                id="povActiveSwitch"
                                                class="form-check-input"
                                                type="checkbox"
                                                role="switch"
                                                :aria-checked="povActive"
                                                :checked="povActive"
                                                @change="changeSwitches('povActiveSwitch'), changeCursor()"
                                            >
                                            <label
                                                class="form-check-label"
                                                for="povActiveSwitch"
                                            >
                                                {{ $t("modules.tools.modeler3D.options.captions.enableFunction") }}
                                            </label>
                                        </div>
                                        <p
                                            class="cta"
                                            v-html="$t('modules.tools.modeler3D.options.captions.povInfo')"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <EntityList
                        v-if="hiddenObjects.length > 0 && !isLoading"
                        id="hidden-objects"
                        :objects="hiddenObjects"
                        :objects-label="$t('modules.tools.modeler3D.hiddenObjectsLabel')"
                        @change-visibility="showObject"
                    />
                </div>
            </div>
        </template>
    </ToolTemplate>
</template>

<style lang="scss" scoped>
    @import "~/css/mixins.scss";
    @import "~variables";

    .h-seperator {
        margin:12px 0 12px 0;
        border: 1px solid #DDDDDD;
    }

    .nav-link {
        font-size: $font_size_big;
    }

    .accordion-button {
        font-size: 0.95rem;
    }

    .cta {
        margin-bottom:12px;
    }

    h2 {
        font-size: $font_size_big;
        font-weight: bold;
        text-transform: none;
        margin: 0 0 6px 0;
    }

    .primary-button-wrapper {
        color: $white;
        background-color: $secondary_focus;
        display: block;
        text-align:center;
        padding: 8px 12px;
        cursor: pointer;
        margin:12px 0 0 0;
        width: 100%;
        font-size: $font_size_big;
        &:focus {
            @include primary_action_focus;
        }
        &:hover {
            @include primary_action_hover;
        }
    }

    .form-switch {
        font-size: $font_size_big;
    }

    .nav-tabs {
        margin-bottom: 1em;
    }
</style>
