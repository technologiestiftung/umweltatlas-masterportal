import {expect} from "chai";
import sinon from "sinon";
import getLayerInformationModule from "../../../utils/getLayerInformation";
import prepareFeaturePropertiesModule from "../../../utils/prepareFeatureProperties";
import actionsWfst from "../../../store/actionsWfst";
import wfs from "@masterportal/masterportalapi/src/layer/wfs";
import Feature from "ol/Feature";
import Polygon from "ol/geom/Polygon";
import loader from "../../../../../../utils/loaderOverlay";

describe("src/modules/tools/wfst/store/actionsWfst.js", () => {
    let commit,
        dispatch,
        getters,
        rootGetters;

    beforeEach(() => {
        commit = sinon.spy();
        dispatch = sinon.spy();
    });
    afterEach(sinon.restore);

    describe("clearInteractions", () => {
        it("should remove all interactions as well as the draw layer", () => {
            actionsWfst.clearInteractions({commit, dispatch});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args.length).to.equal(3);
            expect(commit.firstCall.args[0]).to.equal("Maps/removeLayerFromMap");
            expect(commit.firstCall.args[2]).to.eql({root: true});
            expect(dispatch.callCount).to.equal(4);
            expect(dispatch.firstCall.args.length).to.equal(3);
            expect(dispatch.firstCall.args[0]).to.equal("Maps/removeInteraction");
            expect(dispatch.firstCall.args[2]).to.eql({root: true});
            expect(dispatch.secondCall.args.length).to.equal(3);
            expect(dispatch.secondCall.args[0]).to.equal("Maps/removeInteraction");
            expect(dispatch.secondCall.args[2]).to.eql({root: true});
            expect(dispatch.thirdCall.args.length).to.equal(3);
            expect(dispatch.thirdCall.args[0]).to.equal("Maps/removeInteraction");
            expect(dispatch.thirdCall.args[2]).to.eql({root: true});
            expect(dispatch.lastCall.args.length).to.equal(3);
            expect(dispatch.lastCall.args[0]).to.equal("Maps/removeInteraction");
            expect(dispatch.lastCall.args[2]).to.eql({root: true});
        });
    });
    describe("reset", () => {
        const featurePropertiesSymbol = Symbol("featureProperties");
        let setVisibleSpy;

        beforeEach(() => {
            getters = {
                currentLayerId: "",
                featureProperties: featurePropertiesSymbol
            };
            setVisibleSpy = sinon.spy();
            rootGetters = {
                "Maps/getLayerById": () => ({
                    setVisible: setVisibleSpy
                })
            };
        });

        it("should reset all values to its default state", () => {
            actionsWfst.reset({commit, dispatch, getters, rootGetters});

            expect(commit.calledTwice).to.be.true;
            expect(commit.firstCall.args.length).to.equal(2);
            expect(commit.firstCall.args[0]).to.equal("setFeatureProperties");
            expect(commit.firstCall.args[1]).to.equal(featurePropertiesSymbol);
            expect(commit.secondCall.args.length).to.equal(2);
            expect(commit.secondCall.args[0]).to.equal("setSelectedInteraction");
            expect(commit.secondCall.args[1]).to.equal(null);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args.length).to.equal(1);
            expect(dispatch.firstCall.args[0]).to.equal("clearInteractions");
        });
        it("should reset all values to its default state and activate the current layer if it was previously unselected", () => {
            getters.featureProperties = [{symbol: featurePropertiesSymbol}];

            actionsWfst.reset({commit, dispatch, getters, rootGetters});

            expect(commit.calledTwice).to.be.true;
            expect(commit.firstCall.args.length).to.equal(2);
            expect(commit.firstCall.args[0]).to.equal("setFeatureProperties");
            expect(Array.isArray(commit.firstCall.args[1])).to.be.true;
            expect(commit.firstCall.args[1].length).to.equal(1);
            expect(commit.firstCall.args[1][0]).to.eql({symbol: featurePropertiesSymbol, value: null});
            expect(commit.secondCall.args.length).to.equal(2);
            expect(commit.secondCall.args[0]).to.equal("setSelectedInteraction");
            expect(commit.secondCall.args[1]).to.equal(null);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args.length).to.equal(1);
            expect(dispatch.firstCall.args[0]).to.equal("clearInteractions");
            expect(setVisibleSpy.calledOnce).to.be.true;
            expect(setVisibleSpy.firstCall.args.length).to.equal(1);
            expect(setVisibleSpy.firstCall.args[0]).to.equal(true);
        });
    });
    describe("sendTransaction", () => {
        const layer = {
                id: "0",
                url: "some.good.url",
                isSecured: false,
                useProxy: false
            },
            feature = new Feature({
                geometry: new Polygon([
                    [
                        [
                            9.17782024967994,
                            50.20836600730087
                        ],
                        [
                            9.200676227149245,
                            50.20836600730087
                        ],
                        [
                            9.200676227149245,
                            50.20873353776312
                        ],
                        [
                            9.17782024967994,
                            50.20873353776312
                        ],
                        [
                            9.17782024967994,
                            50.20836600730087
                        ]
                    ]]),
                name: "My Polygon"
            });

        let fakeSendTransaction,
            refreshSpy,
            consoleSpy,
            loaderHideSpy,
            loaderShowSpy;

        beforeEach(() => {
            getters = {
                currentLayerIndex: 0,
                layerInformation: [layer],
                selectedInteraction: "insert"
            };
            fakeSendTransaction = sinon.stub(wfs, "sendTransaction");
            refreshSpy = sinon.spy();
            sinon.stub(Radio, "request").withArgs("ModelList", "getModelByAttributes", {id: layer.id}).returns({
                layer: {
                    getSource: () => ({refresh: refreshSpy})
                }
            });
            consoleSpy = sinon.spy();
            loaderHideSpy = sinon.spy();
            loaderShowSpy = sinon.spy();
            sinon.stub(console, "error").callsFake(consoleSpy);
            sinon.stub(loader, "show").callsFake(loaderShowSpy);
            sinon.stub(loader, "hide").callsFake(loaderHideSpy);
        });
        afterEach(() => {
            sinon.restore();
        });
        it("should send a request to the api and it should return the inserted feature", async () => {
            fakeSendTransaction.resolves(feature);
            const response = await actionsWfst.sendTransaction({dispatch, getters, rootGetters}, feature);

            expect(fakeSendTransaction.calledOnce).to.be.true;
            expect(response).to.deep.equal(feature);

            expect(consoleSpy.notCalled).to.be.true;

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args.length).to.equal(1);
            expect(dispatch.firstCall.args[0]).to.equal("reset");
            expect(loaderShowSpy.calledOnce).to.be.true;
            expect(loaderShowSpy.firstCall.args.length).to.equal(0);
            expect(loaderHideSpy.calledOnce).to.be.true;
            expect(loaderHideSpy.firstCall.args.length).to.equal(0);

        });
        it("should send a request to the api and it should return the updated feature", async () => {
            getters.selectedInteraction = "selectedUpdate";

            fakeSendTransaction.resolves(feature);
            const response = await actionsWfst.sendTransaction({dispatch, getters, rootGetters}, feature);

            expect(fakeSendTransaction.calledOnce).to.be.true;
            expect(response).to.deep.equal(feature);

            expect(consoleSpy.notCalled).to.be.true;

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args.length).to.equal(1);
            expect(dispatch.firstCall.args[0]).to.equal("reset");
            expect(loaderShowSpy.calledOnce).to.be.true;
            expect(loaderShowSpy.firstCall.args.length).to.equal(0);
            expect(loaderHideSpy.calledOnce).to.be.true;
            expect(loaderHideSpy.firstCall.args.length).to.equal(0);
        });
        it("should send an request to the api and show an alert with a success message for a delete transaction", async () => {
            getters.selectedInteraction = "delete";

            fakeSendTransaction.resolves(feature);
            const response = await actionsWfst.sendTransaction({dispatch, getters, rootGetters}, feature);

            expect(fakeSendTransaction.calledOnce).to.be.true;
            expect(response).to.deep.equal(feature);

            expect(consoleSpy.notCalled).to.be.true;

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args.length).to.equal(1);
            expect(dispatch.firstCall.args[0]).to.equal("reset");
            expect(loaderShowSpy.calledOnce).to.be.true;
            expect(loaderShowSpy.firstCall.args.length).to.equal(0);
            expect(loaderHideSpy.calledOnce).to.be.true;
            expect(loaderHideSpy.firstCall.args.length).to.equal(0);
        });
        it("should show an error message and return null if wfs.sendTransaction fails", async () => {
            const error = new Error("Transaction failed");

            fakeSendTransaction.throws(error);
            // eslint-disable-next-line one-var
            const response = await actionsWfst.sendTransaction({dispatch, getters, rootGetters}, feature);

            expect(fakeSendTransaction.calledOnce).to.be.true;

            expect(response).to.equal(null);

            expect(consoleSpy.notCalled).to.be.true;

            expect(loaderShowSpy.calledOnce).to.be.true;
            expect(loaderShowSpy.firstCall.args.length).to.equal(0);
            expect(loaderHideSpy.calledOnce).to.be.true;
            expect(loaderHideSpy.firstCall.args.length).to.equal(0);

            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args.length).to.equal(3);
            expect(dispatch.firstCall.args[0]).to.equal("Alerting/addSingleAlert");
            expect(dispatch.firstCall.args[1]).to.eql({
                category: "Info",
                displayClass: "info",
                content: "Error: Transaction failed",
                mustBeConfirmed: false
            });
            expect(dispatch.firstCall.args[2]).to.eql({root: true});
            expect(dispatch.secondCall.args.length).to.equal(1);
            expect(dispatch.secondCall.args[0]).to.equal("reset");
        });
    });
    describe("setActive", () => {
        const layerIds = ["id"],
            layerInformation = [
                {isSelected: false},
                {isSelected: true}
            ];

        beforeEach(() => {
            getters = {
                layerIds,
                layerInformation
            };
            sinon.stub(getLayerInformationModule, "getLayerInformation").returns(layerInformation);
        });

        it("should add the relevant values to the store and dispatch setFeatureProperties if active is true", () => {
            actionsWfst.setActive({commit, dispatch, getters}, true);

            expect(commit.calledThrice).to.be.true;
            expect(commit.firstCall.args.length).to.equal(2);
            expect(commit.firstCall.args[0]).to.equal("setActive");
            expect(commit.firstCall.args[1]).to.equal(true);
            expect(commit.secondCall.args.length).to.equal(2);
            expect(commit.secondCall.args[0]).to.equal("setLayerInformation");
            expect(commit.secondCall.args[1]).to.equal(layerInformation);
            expect(commit.thirdCall.args.length).to.equal(2);
            expect(commit.thirdCall.args[0]).to.equal("setCurrentLayerIndex");
            expect(commit.thirdCall.args[1]).to.equal(1);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args.length).to.equal(1);
            expect(dispatch.firstCall.args[0]).to.equal("setFeatureProperties");
        });
        it("should dispatch reset if active is false", () => {
            actionsWfst.setActive({commit, dispatch, getters}, false);

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args.length).to.equal(2);
            expect(commit.firstCall.args[0]).to.equal("setActive");
            expect(commit.firstCall.args[1]).to.equal(false);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args.length).to.equal(1);
            expect(dispatch.firstCall.args[0]).to.equal("reset");
        });
    });
    describe("setFeatureProperty", () => {
        let featureProperty;

        beforeEach(() => {
            featureProperty = {
                type: "number",
                value: "3",
                key: "specialKey"
            };
        });

        it("should commit the property if the type is fitting to the value", () => {
            actionsWfst.setFeatureProperty({commit, dispatch}, featureProperty);

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args.length).to.equal(2);
            expect(commit.firstCall.args[0]).to.equal("setFeatureProperty");
            expect(commit.firstCall.args[1]).to.eql({key: featureProperty.key, value: featureProperty.value});
            expect(dispatch.notCalled).to.be.true;
        });
        it("should dispatch an alert if the type is a number but the converted value is not", () => {
            featureProperty.value = "noNumber";

            actionsWfst.setFeatureProperty({commit, dispatch}, featureProperty);

            expect(commit.notCalled).to.be.true;
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args.length).to.equal(3);
            expect(dispatch.firstCall.args[0]).to.equal("Alerting/addSingleAlert");
            expect(dispatch.firstCall.args[1]).to.eql({
                category: "Info",
                displayClass: "info",
                content: "modules.tools.wfsTransaction.error.onlyNumbersAllowed",
                mustBeConfirmed: false
            });
            expect(dispatch.firstCall.args[2]).to.eql({root: true});
        });
    });
    describe("setFeatureProperties", () => {
        let prepareFeaturePropertiesSpy;

        beforeEach(() => {
            getters = {
                currentLayerIndex: 0,
                layerInformation: [{}]
            };
            prepareFeaturePropertiesSpy = sinon.spy();
            sinon.stub(prepareFeaturePropertiesModule, "prepareFeatureProperties").callsFake(prepareFeaturePropertiesSpy);
        });

        it("should commit featureProperties on basis of the layer if a layer is selected that has a featurePrefix configured and is selected in the layer tree", async () => {
            getters.layerInformation[0].featurePrefix = "pre";
            getters.layerInformation[0].isSelected = true;

            await actionsWfst.setFeatureProperties({commit, getters});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args.length).to.equal(2);
            expect(commit.firstCall.args[0]).to.equal("setFeatureProperties");
            expect(prepareFeaturePropertiesSpy.calledOnce).to.be.true;
        });
        it("should commit an error message if no layer is currently selected", async () => {
            getters.currentLayerIndex = -1;

            await actionsWfst.setFeatureProperties({commit, getters});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args.length).to.equal(2);
            expect(commit.firstCall.args[0]).to.equal("setFeatureProperties");
            expect(commit.firstCall.args[1]).to.equal("modules.tools.wfsTransaction.error.allLayersNotSelected");
            expect(prepareFeaturePropertiesSpy.notCalled).to.be.true;
        });
        it("should commit an error message if the currently selected layer has no featurePrefix configured", async () => {
            await actionsWfst.setFeatureProperties({commit, getters});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args.length).to.equal(2);
            expect(commit.firstCall.args[0]).to.equal("setFeatureProperties");
            expect(commit.firstCall.args[1]).to.equal("modules.tools.wfsTransaction.error.layerNotConfiguredCorrectly");
            expect(prepareFeaturePropertiesSpy.notCalled).to.be.true;
        });
        it("should commit an error message if the currently selected layer is not selected in the layer tree", async () => {
            getters.layerInformation[0].featurePrefix = "pre";
            getters.layerInformation[0].isSelected = false;

            await actionsWfst.setFeatureProperties({commit, getters});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args.length).to.equal(2);
            expect(commit.firstCall.args[0]).to.equal("setFeatureProperties");
            expect(commit.firstCall.args[1]).to.equal("modules.tools.wfsTransaction.error.layerNotSelected");
            expect(prepareFeaturePropertiesSpy.notCalled).to.be.true;
        });
    });
});
