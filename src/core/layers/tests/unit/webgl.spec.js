import Feature from "ol/Feature";
import {expect} from "chai";
import sinon from "sinon";
import Layer from "../../layer";
import GeoJsonLayer from "../../geojson";
import VectorLayer from "ol/layer/Layer";
import VectorSource from "ol/source/Vector";
import webgl from "../../renderer/webgl";

describe("src/core/layers/renderer/webgl.js", () => {
    let attributes, olLayer, source;

    beforeEach(() => {
        attributes = {
            name: "TestLayer",
            id: "id",
            typ: "GeoJSON",
            renderer: "webgl"
        };
        source = new VectorSource();
        olLayer = new VectorLayer({source});
    });
    describe("setLayerProperties", () => {
        it("should override necessary class properties", () => {
            const layerObject = new Layer(attributes, olLayer, false);

            webgl.setLayerProperties(layerObject);
            expect(layerObject.isDisposed).to.equal(webgl.isDisposed);
            expect(layerObject.setIsSelected).to.equal(webgl.setIsSelected);
            expect(layerObject.hideAllFeatures).to.equal(webgl.hideAllFeatures);
            expect(layerObject.showAllFeatures).to.equal(webgl.showAllFeatures);
            expect(layerObject.showFeaturesByIds).to.equal(webgl.showFeaturesByIds);
            expect(layerObject.setStyle).to.equal(webgl.setStyle);
            expect(layerObject.styling).to.equal(webgl.setStyle);
        });
    });
    describe("isDisposed", () => {
        it("should return true if olLayer is disposed", () => {
            const layerObject = new Layer(attributes, olLayer, false);

            layerObject.layer.dispose();
            expect(webgl.isDisposed.call(layerObject)).to.be.true;
        });
        it("should return true if olLayer doesn't exist", () => {
            const layerObject = new Layer(attributes, olLayer, false);

            layerObject.layer = null;
            expect(webgl.isDisposed.call(layerObject)).to.be.true;
        });
        it("should return false if layer healthy", () => {
            const layerObject = new Layer(attributes, olLayer, false);

            expect(webgl.isDisposed.call(layerObject)).to.be.false;
        });
    });
    describe("setIsSelected", () => {
        it("should call the original setIsSelected method", () => {
            const layerObject = new Layer(attributes, olLayer, false),
                stub = sinon.stub(Layer.prototype, "setIsSelected");

            webgl.setLayerProperties(layerObject);
            layerObject.setIsSelected(true);
            expect(stub.calledOnce).to.be.true;
        });
        it("should create a new layer instance if layer is disposed", () => {
            const layerObject = new Layer(attributes, olLayer, false);

            webgl.setLayerProperties(layerObject);
            layerObject.layer.dispose();
            layerObject.set("isVisibleInMap", true);
            layerObject.setIsSelected(true);
            expect(layerObject.layer.disposed).to.be.false;
        });
        it("should keep the original style from the old layer instance, even if it is overwritten by the resp. layer class", () => {
            const
                style = {
                    symbol: {
                        symbolType: "circle",
                        size: 20,
                        color: "#006688",
                        rotateWithView: false,
                        offset: [0, 0],
                        opacity: 0.6
                    }
                },
                layerObject = new GeoJsonLayer({
                    ...attributes,
                    style,
                    isPointLayer: true
                }, olLayer, false);

            layerObject.set("style", {});
            layerObject.layer.dispose();
            layerObject.set("isVisibleInMap", true);
            layerObject.setIsSelected(true);
            expect(layerObject.layer.get("style")).to.deep.equal(style);
        });
        it("should dispose layer when layer is set invisible", () => {
            const layerObject = new Layer(attributes, olLayer, false);

            webgl.setLayerProperties(layerObject);
            layerObject.set("isVisibleInMap", false);
            layerObject.setIsSelected(false);
            webgl.setIsSelected.call(layerObject, false);
            expect(layerObject.layer.disposed).to.be.true;
        });
    });
    describe("hideAllFeatures", () => {
        it("should remove all features from the source", () => {
            const layerObject = new Layer(attributes, olLayer, false);

            webgl.setLayerProperties(layerObject);
            layerObject.layer.getSource().addFeature(new Feature({id: "0"}));
            layerObject.hideAllFeatures();
            expect(layerObject.layer.getSource().getFeatures()).to.have.lengthOf(0);
        });
    });
    describe("showAllFeatures", () => {
        it("should make source features equal layerObject features", () => {
            const layerObject = new Layer(attributes, olLayer, false),
                feature1 = new Feature({id: "0"}),
                feature2 = new Feature({id: "1"});

            webgl.setLayerProperties(layerObject);
            layerObject.features = [feature1, feature2];
            layerObject.layer.getSource().addFeature(feature1);
            layerObject.showAllFeatures();
            expect(layerObject.layer.getSource().getFeatures()).to.deep.equal(layerObject.features);
        });
    });
    describe("showFeaturesByIds", () => {
        it("should show features with given ids", () => {
            const layerObject = new Layer(attributes, olLayer, false);

            webgl.setLayerProperties(layerObject);
            layerObject.features = [new Feature(), new Feature()];
            layerObject.features.forEach((f, i) => f.setId(i));
            layerObject.showFeaturesByIds([1]);
            expect(layerObject.layer.getSource().getFeatures()).to.have.lengthOf(1);
            expect(layerObject.layer.getSource().getFeatures()[0].getId()).to.equal(1);
        });
    });
});
