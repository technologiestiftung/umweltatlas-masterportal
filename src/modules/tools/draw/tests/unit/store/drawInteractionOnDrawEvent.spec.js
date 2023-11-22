import sinon from "sinon";
import {expect} from "chai";
import {Style} from "ol/style.js";
import createStyleModule from "../../../utils/style/createStyle";
import circleCalculations from "../../../utils/circleCalculations";
import {drawInteractionOnDrawEvent, featureStyle, handleDrawEvent} from "../../../store/actions/drawInteractionOnDrawEvent";


describe("src/modules/tools/draw/store/actions/drawInteractionOnDrawEvent.js", () => {
    const errorBorder = "#E10019";
    let map,
        commit,
        dispatch,
        state,
        rootState,
        onceSpy,
        removeFeatureSpy,
        finishDrawingSpy,
        createdStyle,
        createStyleStub,
        calculateCircleStub;

    beforeEach(() => {
        map = {
            id: "ol",
            mode: "2D"
        };
        mapCollection.clear();
        mapCollection.addMap(map, "2D");
        commit = sinon.spy();
        dispatch = sinon.spy();

        onceSpy = sinon.spy();
        removeFeatureSpy = sinon.spy();
        finishDrawingSpy = sinon.spy();
        createdStyle = new Style();
        createStyleStub = sinon.stub(createStyleModule, "createStyle").returns(createdStyle);
        calculateCircleStub = sinon.stub(circleCalculations, "calculateCircle");
        state = {
            layer: {
                getSource: () => ({
                    once: onceSpy,
                    removeFeature: removeFeatureSpy
                })
            },
            drawType: {
                id: "drawSymbol",
                geometry: "Point"
            },
            symbol: {},
            freehand: false,
            drawCircleSettings: {
                circleMethod: "defined",
                circleRadius: 0
            },
            drawDoubleCircleSettings: {
                circleMethod: "defined",
                circleRadius: 0,
                circleOuterRadius: 0
            },
            drawSymbolSettings: {
                color: [153, 153, 153, 1],
                opacity: 1
            },
            drawInteraction: {
                finishDrawing: finishDrawingSpy
            },
            currentInteraction: ""
        };
        rootState = {
            Maps: {
                mode: "2D"
            }
        };
    });
    afterEach(sinon.restore);

    describe("drawInteractionOnDrawEvent", () => {
        it("drawInteractionOnDrawEvent no circle", () => {
            const drawInteraction = "";

            drawInteractionOnDrawEvent({state, commit, dispatch}, drawInteraction);

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).to.equal("setAddFeatureListener");
            expect(onceSpy.calledOnce).to.be.true;
            expect(onceSpy.firstCall.args[0]).to.equal("addfeature");
        });

        it("drawInteractionOnDrawEvent draw circle shall call finishDrawing on interaction", () => {
            state.currentInteraction = "draw";
            state.drawType.geometry = "Circle";
            state.drawType.id = "drawCircle";

            const drawInteraction = "";

            drawInteractionOnDrawEvent({state, commit, dispatch}, drawInteraction);

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).to.equal("setAddFeatureListener");
            expect(finishDrawingSpy.calledOnce).to.be.true;
        });
    });

    describe("handleDrawEvent", () => {
        let event,
            isVisible,
            drawState;

        beforeEach(() => {
            isVisible = false;
            drawState = {
                drawType: {
                    id: "drawCircle"
                }
            };
            event = {
                feature: {
                    set: sinon.spy(),
                    get: (key) => {
                        if (key === "drawState") {
                            return drawState;
                        }
                        else if (key === "isVisible") {
                            return isVisible;
                        }
                        return "";
                    },
                    setStyle: sinon.spy(),
                    getGeometry: () => {
                        return {
                            getCenter: () => [0, 0]
                        };
                    }
                }
            };
        });

        it("handleDrawEvent no circle call createStyle", () => {
            state.zIndex = 1;
            isVisible = true;
            handleDrawEvent({state, commit, dispatch, rootState}, event);

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equal("updateUndoArray");
            expect(dispatch.firstCall.args[1]).to.be.deep.equal({remove: false, feature: event.feature});
            expect(event.feature.set.calledTwice).to.be.true;
            expect(event.feature.set.firstCall.args[0]).to.equal("fromDrawTool");
            expect(event.feature.set.firstCall.args[1]).to.be.true;
            expect(event.feature.set.secondCall.args[0]).to.equal("invisibleStyle");
            expect(event.feature.set.secondCall.args[1]).to.be.deep.equal(createdStyle);
            expect(event.feature.setStyle.calledOnce).to.be.true;
            expect(createStyleStub.calledOnce).to.be.true;
            expect(createStyleStub.firstCall.args[0]).to.be.deep.equal(drawState);
            expect(createStyleStub.firstCall.args[1]).to.be.deep.equal(state.drawSymbolSettings);
            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).to.equal("setZIndex");
            expect(commit.firstCall.args[1]).to.equal(2);
        });

        it("handleDrawEvent no circle", () => {
            state.zIndex = 1;
            handleDrawEvent({state, commit, dispatch, rootState}, event);

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equal("updateUndoArray");
            expect(dispatch.firstCall.args[1]).to.be.deep.equal({remove: false, feature: event.feature});
            expect(event.feature.set.calledTwice).to.be.true;
            expect(event.feature.set.firstCall.args[0]).to.equal("fromDrawTool");
            expect(event.feature.set.firstCall.args[1]).to.be.true;
            expect(event.feature.set.secondCall.args[0]).to.equal("invisibleStyle");
            expect(event.feature.set.secondCall.args[1]).to.be.deep.equal(createdStyle);
            expect(event.feature.setStyle.calledOnce).to.be.true;
            expect(commit.calledOnce).to.be.true;
            expect(createStyleStub.calledOnce).to.be.true;
            expect(createStyleStub.firstCall.args[0]).to.be.deep.equal(drawState);
            expect(createStyleStub.firstCall.args[1]).to.be.deep.equal(state.drawSymbolSettings);
            expect(commit.firstCall.args[0]).to.equal("setZIndex");
            expect(commit.firstCall.args[1]).to.equal(2);
        });

        it("handleDrawEvent circle: alert radius not defined", () => {
            state.currentInteraction = "draw";
            state.drawType.geometry = "Circle";
            state.drawType.id = "drawCircle";
            state.zIndex = 1;
            handleDrawEvent({state, commit, dispatch, rootState}, event);

            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equal("updateUndoArray");
            expect(dispatch.firstCall.args[1]).to.be.deep.equal({remove: false, feature: event.feature});
            expect(dispatch.secondCall.args[0]).to.equal("Alerting/addSingleAlert");
            expect(dispatch.secondCall.args[1]).to.be.equal("modules.tools.draw.undefinedRadius");
            expect(event.feature.set.calledTwice).to.be.true;
            expect(event.feature.set.firstCall.args[0]).to.equal("fromDrawTool");
            expect(event.feature.set.firstCall.args[1]).to.be.true;
            expect(event.feature.set.secondCall.args[0]).to.equal("invisibleStyle");
            expect(event.feature.set.secondCall.args[1]).to.be.deep.equal(createdStyle);
            expect(event.feature.setStyle.calledOnce).to.be.true;
            expect(removeFeatureSpy.calledOnce).to.be.true;
            expect(state.outerBorderColor).to.be.undefined;
            expect(state.innerBorderColor).to.equal(errorBorder);
            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).to.equal("setZIndex");
            expect(commit.firstCall.args[1]).to.equal(2);
        });

        it("handleDrawEvent doubleCircle: alert two circles not defined", () => {
            state.currentInteraction = "draw";
            state.drawType.geometry = "Circle";
            state.drawType.id = "drawDoubleCircle";
            state.zIndex = 1;
            handleDrawEvent({state, commit, dispatch, rootState}, event);

            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equal("updateUndoArray");
            expect(dispatch.firstCall.args[1]).to.be.deep.equal({remove: false, feature: event.feature});
            expect(dispatch.secondCall.args[0]).to.equal("Alerting/addSingleAlert");
            expect(dispatch.secondCall.args[1]).to.be.equal("modules.tools.draw.undefinedTwoCircles");
            expect(event.feature.set.calledTwice).to.be.true;
            expect(event.feature.set.firstCall.args[0]).to.equal("fromDrawTool");
            expect(event.feature.set.firstCall.args[1]).to.be.true;
            expect(event.feature.set.secondCall.args[0]).to.equal("invisibleStyle");
            expect(event.feature.set.secondCall.args[1]).to.be.deep.equal(createdStyle);
            expect(event.feature.setStyle.calledOnce).to.be.true;
            expect(removeFeatureSpy.calledOnce).to.be.true;
            expect(state.outerBorderColor).to.equal(errorBorder);
            expect(state.innerBorderColor).to.equal(errorBorder);
            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).to.equal("setZIndex");
            expect(commit.firstCall.args[1]).to.equal(2);
        });

        it("handleDrawEvent doubleCircle: alert inner circle not defined", () => {
            state.currentInteraction = "draw";
            state.drawType.geometry = "Circle";
            state.drawType.id = "drawDoubleCircle";
            state.drawDoubleCircleSettings.circleOuterRadius = 10;
            state.zIndex = 1;
            handleDrawEvent({state, commit, dispatch, rootState}, event);

            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equal("updateUndoArray");
            expect(dispatch.firstCall.args[1]).to.be.deep.equal({remove: false, feature: event.feature});
            expect(dispatch.secondCall.args[0]).to.equal("Alerting/addSingleAlert");
            expect(dispatch.secondCall.args[1]).to.be.equal("modules.tools.draw.undefinedInnerCircle");
            expect(event.feature.set.calledTwice).to.be.true;
            expect(event.feature.set.firstCall.args[0]).to.equal("fromDrawTool");
            expect(event.feature.set.firstCall.args[1]).to.be.true;
            expect(event.feature.set.secondCall.args[0]).to.equal("invisibleStyle");
            expect(event.feature.set.secondCall.args[1]).to.be.deep.equal(createdStyle);
            expect(event.feature.setStyle.calledOnce).to.be.true;
            expect(removeFeatureSpy.calledOnce).to.be.true;
            expect(state.outerBorderColor).to.equal("");
            expect(state.innerBorderColor).to.equal(errorBorder);
            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).to.equal("setZIndex");
            expect(commit.firstCall.args[1]).to.equal(2);
        });

        it("handleDrawEvent doubleCircle: alert outer circle not defined", () => {
            state.currentInteraction = "draw";
            state.drawType.geometry = "Circle";
            state.drawType.id = "drawDoubleCircle";
            state.drawDoubleCircleSettings.circleRadius = 10;
            state.drawDoubleCircleSettings.circleOuterRadius = 0;
            state.zIndex = 1;
            handleDrawEvent({state, commit, dispatch, rootState}, event);

            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equal("updateUndoArray");
            expect(dispatch.firstCall.args[1]).to.be.deep.equal({remove: false, feature: event.feature});
            expect(dispatch.secondCall.args[0]).to.equal("Alerting/addSingleAlert");
            expect(dispatch.secondCall.args[1]).to.be.equal("modules.tools.draw.undefinedOuterCircle");
            expect(event.feature.set.calledTwice).to.be.true;
            expect(event.feature.set.firstCall.args[0]).to.equal("fromDrawTool");
            expect(event.feature.set.firstCall.args[1]).to.be.true;
            expect(event.feature.set.secondCall.args[0]).to.equal("invisibleStyle");
            expect(event.feature.set.secondCall.args[1]).to.be.deep.equal(createdStyle);
            expect(event.feature.setStyle.calledOnce).to.be.true;
            expect(removeFeatureSpy.calledOnce).to.be.true;
            expect(state.outerBorderColor).to.equal(errorBorder);
            expect(state.innerBorderColor).to.equal("");
            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).to.equal("setZIndex");
            expect(commit.firstCall.args[1]).to.equal(2);
        });

        it("handleDrawEvent circle: calculateCircle", () => {
            state.currentInteraction = "draw";
            state.drawType.geometry = "Circle";
            state.drawType.id = "drawCircle";
            state.drawCircleSettings.circleRadius = 10;
            state.drawCircleSettings.circleOuterRadius = 0;
            state.zIndex = 1;
            handleDrawEvent({state, commit, dispatch, rootState}, event);

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equal("updateUndoArray");
            expect(dispatch.firstCall.args[1]).to.be.deep.equal({remove: false, feature: event.feature});
            expect(event.feature.set.calledTwice).to.be.true;
            expect(event.feature.set.firstCall.args[0]).to.equal("fromDrawTool");
            expect(event.feature.set.firstCall.args[1]).to.be.true;
            expect(event.feature.set.secondCall.args[0]).to.equal("invisibleStyle");
            expect(event.feature.set.secondCall.args[1]).to.be.deep.equal(createdStyle);
            expect(event.feature.setStyle.calledOnce).to.be.true;
            expect(removeFeatureSpy.notCalled).to.be.true;
            expect(state.outerBorderColor).to.equal(undefined);
            expect(state.innerBorderColor).to.equal("");
            expect(calculateCircleStub.calledOnce).to.be.true;
            expect(calculateCircleStub.firstCall.args[0]).to.be.deep.equal(event);
            expect(calculateCircleStub.firstCall.args[1]).to.be.deep.equal([0, 0]);
            expect(calculateCircleStub.firstCall.args[2]).to.be.equal(10);
            expect(calculateCircleStub.firstCall.args[3]).to.be.deep.equal(map);
            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).to.equal("setZIndex");
            expect(commit.firstCall.args[1]).to.equal(2);
        });

        it("handleDrawEvent draw circle: calculateCircle no outer radius", () => {
            state.currentInteraction = "draw";
            state.drawType.geometry = "Circle";
            state.drawType.id = "drawCircle";
            state.drawCircleSettings.circleRadius = 10;
            state.drawCircleSettings.circleOuterRadius = 0;
            state.zIndex = 1;
            handleDrawEvent({state, commit, dispatch, rootState}, event);

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equal("updateUndoArray");
            expect(dispatch.firstCall.args[1]).to.be.deep.equal({remove: false, feature: event.feature});
            expect(event.feature.set.calledTwice).to.be.true;
            expect(event.feature.set.firstCall.args[0]).to.equal("fromDrawTool");
            expect(event.feature.set.firstCall.args[1]).to.be.true;
            expect(event.feature.set.secondCall.args[0]).to.equal("invisibleStyle");
            expect(event.feature.set.secondCall.args[1]).to.be.deep.equal(createdStyle);
            expect(event.feature.setStyle.calledOnce).to.be.true;
            expect(removeFeatureSpy.notCalled).to.be.true;
            expect(state.outerBorderColor).to.equal(undefined);
            expect(state.innerBorderColor).to.equal("");
            expect(calculateCircleStub.calledOnce).to.be.true;
            expect(calculateCircleStub.firstCall.args[0]).to.be.deep.equal(event);
            expect(calculateCircleStub.firstCall.args[1]).to.be.deep.equal([0, 0]);
            expect(calculateCircleStub.firstCall.args[2]).to.be.equal(10);
            expect(calculateCircleStub.firstCall.args[3]).to.be.deep.equal(map);
            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).to.equal("setZIndex");
            expect(commit.firstCall.args[1]).to.equal(2);
        });

        it("handleDrawEvent draw circle: calculateCircle", () => {
            state.currentInteraction = "draw";
            state.drawType.geometry = "Circle";
            state.drawType.id = "drawCircle";
            state.drawCircleSettings.circleRadius = 10;
            state.drawCircleSettings.circleOuterRadius = 10;
            state.zIndex = 1;
            handleDrawEvent({state, commit, dispatch, rootState}, event);

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equal("updateUndoArray");
            expect(dispatch.firstCall.args[1]).to.be.deep.equal({remove: false, feature: event.feature});
            expect(event.feature.set.calledTwice).to.be.true;
            expect(event.feature.set.firstCall.args[0]).to.equal("fromDrawTool");
            expect(event.feature.set.firstCall.args[1]).to.be.true;
            expect(event.feature.set.secondCall.args[0]).to.equal("invisibleStyle");
            expect(event.feature.set.secondCall.args[1]).to.be.deep.equal(createdStyle);
            expect(event.feature.setStyle.calledOnce).to.be.true;
            expect(removeFeatureSpy.notCalled).to.be.true;
            expect(state.outerBorderColor).to.equal("");
            expect(state.innerBorderColor).to.equal("");
            expect(calculateCircleStub.calledOnce).to.be.true;
            expect(calculateCircleStub.firstCall.args[0]).to.be.deep.equal(event);
            expect(calculateCircleStub.firstCall.args[1]).to.be.deep.equal([0, 0]);
            expect(calculateCircleStub.firstCall.args[2]).to.be.equal(10);
            expect(calculateCircleStub.firstCall.args[3]).to.be.deep.equal(map);
            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).to.equal("setZIndex");
            expect(commit.firstCall.args[1]).to.equal(2);
        });
    });

    describe("featureStyle", () => {
        it("featureStyle", () => {
            const drawState = {
                    drawType: {
                        id: "drawCircle"
                    }
                },
                feature = {
                    set: sinon.spy(),
                    get: (key) => {
                        if (key === "drawState") {
                            return drawState;
                        }
                        else if (key === "isVisible") {
                            return true;
                        }
                        return "";
                    },
                    setStyle: sinon.spy(),
                    getGeometry: () => {
                        return {
                            getCenter: () => [0, 0]
                        };
                    }
                };

            featureStyle(state.drawSymbolSettings)(feature);

            expect(createStyleStub.calledOnce).to.be.true;
            expect(createStyleStub.firstCall.args[0]).to.be.deep.equal(drawState);
            expect(createStyleStub.firstCall.args[1]).to.be.deep.equal(Object.assign({}, state.drawSymbolSettings, drawState));
        });
    });
});
