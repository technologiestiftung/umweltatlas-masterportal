import createStyleModule from "../../utils/style/createStyle";
import circleCalculations from "../../utils/circleCalculations";

const errorBorder = "#E10019";

/**
 * Creates a listener for the addfeature event of the source of the layer used for the Draw Tool.
 * NOTE: Should the zIndex only be counted up if the feature gets actually drawn?
 *
 * @param {Object} context actions context object.
 * @param {String} drawInteraction Either an empty String or "Two" to identify for which drawInteraction this is used.
 * @returns {void}
 */
export function drawInteractionOnDrawEvent ({state, commit, dispatch}, drawInteraction) {
    // we need a clone of styleSettings each time a draw event is called, otherwise the copy will influence former drawn objects
    // using "{styleSettings} = getters," would lead to a copy not a clone - don't use getters for styleSettings here
    const styleSettings = JSON.parse(JSON.stringify(state[state.drawType.id + "Settings"])),
        circleMethod = styleSettings.circleMethod;

    commit("setAddFeatureListener", state.layer.getSource().once("addfeature", event => dispatch("handleDrawEvent", event)));
    if (state.currentInteraction === "draw" && circleMethod === "defined" && state.drawType.geometry === "Circle") {
        const interaction = state["drawInteraction" + drawInteraction];

        interaction.finishDrawing();
    }
}

/**
 * Handles the draw event.
 * @param {Object} context actions context object.
 * @param {Object} event drawInteraction event
 * @returns {void}
 */
export function handleDrawEvent ({state, commit, dispatch, rootState}, event) {
    const stateKey = state.drawType.id + "Settings",
        drawType = state.drawType,
        layerSource = state.layer.getSource(),
        // we need a clone of styleSettings each time a draw event is called, otherwise the copy will influence former drawn objects
        // using "{styleSettings} = getters," would lead to a copy not a clone - don't use getters for styleSettings here
        styleSettings = JSON.parse(JSON.stringify(state[stateKey])),
        circleMethod = styleSettings.circleMethod;

    event.feature.set("fromDrawTool", true);
    dispatch("updateUndoArray", {remove: false, feature: event.feature});
    if (circleMethod === "defined" && drawType.geometry === "Circle") {
        const innerRadius = !isNaN(styleSettings.circleRadius) ? parseFloat(styleSettings.circleRadius) : null,
            outerRadius = !isNaN(styleSettings.circleOuterRadius) ? parseFloat(styleSettings.circleOuterRadius) : null,
            circleRadius = event.feature.get("isOuterCircle") ? outerRadius : innerRadius,
            circleCenter = event.feature.getGeometry().getCenter();

        if (innerRadius === null || innerRadius === 0) {
            state.innerBorderColor = errorBorder;

            if (drawType.id === "drawDoubleCircle") {
                if (outerRadius === null || outerRadius === 0) {
                    dispatch("Alerting/addSingleAlert", i18next.t("common:modules.tools.draw.undefinedTwoCircles"), {root: true});
                    layerSource.removeFeature(event.feature);
                    state.outerBorderColor = errorBorder;
                }
                else {
                    dispatch("Alerting/addSingleAlert", i18next.t("common:modules.tools.draw.undefinedInnerCircle"), {root: true});
                    layerSource.removeFeature(event.feature);
                    state.outerBorderColor = "";
                }
            }
            else {
                dispatch("Alerting/addSingleAlert", i18next.t("common:modules.tools.draw.undefinedRadius"), {root: true});
                layerSource.removeFeature(event.feature);
            }
        }
        else {
            if (outerRadius === null || outerRadius === 0) {
                if (drawType.id === "drawDoubleCircle") {
                    dispatch("Alerting/addSingleAlert", i18next.t("common:modules.tools.draw.undefinedOuterCircle"), {root: true});
                    layerSource.removeFeature(event.feature);
                    state.outerBorderColor = errorBorder;
                }
                else {
                    circleCalculations.calculateCircle(event, circleCenter, circleRadius, mapCollection.getMap(rootState.Maps.mode));
                }
            }
            else {
                circleCalculations.calculateCircle(event, circleCenter, circleRadius, mapCollection.getMap(rootState.Maps.mode));
                state.outerBorderColor = "";
            }
            state.innerBorderColor = "";
        }
    }

    if (event.feature.get("isOuterCircle")) {
        styleSettings.colorContour = styleSettings.outerColorContour;
    }
    event.feature.setStyle(featureStyle(styleSettings));
    event.feature.set("invisibleStyle", createStyleModule.createStyle(event.feature.get("drawState"), styleSettings));
    commit("setZIndex", state.zIndex + 1);
}

/**
 * Returns a function to style feature.
 * @param {Object} styleSettings settings for style
 * @returns {Function} a function to style feature
 */
export function featureStyle (styleSettings) {
    return (feature) => {
        if (feature.get("isVisible")) {
            return createStyleModule.createStyle(feature.get("drawState"), Object.assign({}, styleSettings, feature.get("drawState")));
        }
        return undefined;
    };
}
