import Map from "ol/Map";
import View from "ol/View";
import {Style} from "ol/style.js";
import VectorSource from "ol/source/Vector.js";
import VectorLayer from "ol/layer/Vector.js";
import Cluster from "ol/source/Cluster.js";
import {expect} from "chai";
import sinon from "sinon";
import OAFLayer from "../../oaf";
import store from "../../../../app-store";
import styleList from "@masterportal/masterportalapi/src/vectorStyle/styleList.js";
import createStyle from "@masterportal/masterportalapi/src/vectorStyle/createStyle.js";
import getGeometryTypeFromService from "@masterportal/masterportalapi/src/vectorStyle/lib/getGeometryTypeFromService";
import webgl from "../../renderer/webgl";

describe("src/core/layers/oaf.js", () => {
    let attributes,
        style1 = null,
        style2 = null,
        style3 = null;
    const consoleWarn = console.warn,
        featuresToShow = [{
            getId: () => "1",
            get: () => sinon.stub(),
            set: () => sinon.stub(),
            setStyle: (fn) => {
                style1 = fn;
            }
        },
        {
            getId: () => "2",
            get: () => sinon.stub(),
            set: () => sinon.stub(),
            setStyle: (fn) => {
                style2 = fn;
            }
        },
        {
            getId: () => "3",
            get: () => sinon.stub(),
            set: () => sinon.stub(),
            setStyle: (fn) => {
                style3 = fn;
            }
        }];

    before(() => {
        mapCollection.clear();
        const map = new Map({
            id: "ol",
            mode: "2D",
            view: new View(),
            addInteraction: sinon.stub(),
            removeInteraction: sinon.stub(),
            // addLayer: () => sinon.stub(),
            getView: () => {
                return {
                    getResolutions: () => [2000, 1000]
                };
            }
        });

        mapCollection.addMap(map, "2D");
        attributes = {
            url: "https://url.de",
            name: "oafTestLayer",
            id: "id",
            typ: "oaf",
            gfiTheme: "gfiTheme",
            isChildLayer: false,
            transparent: false,
            isSelected: false,
            collection: "krankenhaeuser_hh",
            crs: "crs"
        };
        store.getters = {
            treeType: "custom"
        };
        console.warn = sinon.stub();
    });

    afterEach(() => {
        sinon.restore();
        console.warn = consoleWarn;
    });

    describe("createLayer", () => {
        it("createLayer shall create an ol.VectorLayer with source and style and OAF-format", function () {
            const oafLayer = new OAFLayer(attributes),
                layer = oafLayer.get("layer");

            expect(layer).to.be.an.instanceof(VectorLayer);
            expect(layer.getSource()).to.be.an.instanceof(VectorSource);
            expect(typeof layer.getStyleFunction()).to.be.equals("function");
            expect(layer.get("id")).to.be.equals(attributes.id);
            expect(layer.get("name")).to.be.equals(attributes.name);
            expect(layer.get("gfiTheme")).to.be.equals(attributes.gfiTheme);
        });
        it("createLayer shall create an ol.VectorLayer with cluster-source", function () {
            attributes.clusterDistance = 60;
            const oafLayer = new OAFLayer(attributes),
                layer = oafLayer.get("layer");

            expect(layer).to.be.an.instanceof(VectorLayer);
            expect(layer.getSource()).to.be.an.instanceof(Cluster);
            expect(layer.getSource().getDistance()).to.be.equals(attributes.clusterDistance);
            expect(typeof layer.getStyleFunction()).to.be.equals("function");
        });
        it("createLayer with isSelected=true shall set layer visible", function () {
            attributes.isSelected = true;
            const oafLayer = new OAFLayer(attributes),
                layer = oafLayer.get("layer");

            expect(layer).to.be.an.instanceof(VectorLayer);
            expect(layer.getSource()).to.be.an.instanceof(VectorSource);
            expect(oafLayer.get("isVisibleInMap")).to.be.true;
            expect(oafLayer.get("layer").getVisible()).to.be.true;
        });
        it("createLayer with isSelected=false shall set layer not visible", function () {
            attributes.isSelected = false;
            const oafLayer = new OAFLayer(attributes),
                layer = oafLayer.get("layer");

            expect(layer).to.be.an.instanceof(VectorLayer);
            expect(layer.getSource()).to.be.an.instanceof(VectorSource);
            expect(oafLayer.get("isVisibleInMap")).to.be.false;
            expect(oafLayer.get("layer").getVisible()).to.be.false;
        });
    });
    describe("getFeaturesFilterFunction", () => {
        it("getFeaturesFilterFunction shall filter getGeometry", function () {
            const oafLayer = new OAFLayer(attributes),
                featuresFilterFunction = oafLayer.getFeaturesFilterFunction(attributes),
                features = [{
                    id: "1",
                    getGeometry: () => sinon.stub()
                },
                {
                    id: "2",
                    getGeometry: () => undefined
                }];

            expect(typeof featuresFilterFunction).to.be.equals("function");
            expect(featuresFilterFunction(features).length).to.be.equals(1);

        });
        it("getFeaturesFilterFunction shall filter bboxGeometry", function () {
            attributes.bboxGeometry = {
                intersectsCoordinate: (coord) => {
                    if (coord[0] === 0.5 && coord[1] === 0.5) {
                        return true;
                    }
                    return false;
                },
                getExtent: () => [0, 0, 1, 1]
            };
            const oafLayer = new OAFLayer(attributes),
                featuresFilterFunction = oafLayer.getFeaturesFilterFunction(attributes),
                features = [{
                    id: "1",
                    getGeometry: () => {
                        return {
                            getExtent: () => [0, 0, 1, 1]
                        };

                    }
                },
                {
                    id: "2",
                    getGeometry: () => undefined
                },
                {
                    id: "3",
                    getGeometry: () => {
                        return {
                            getExtent: () => [2, 2, 3, 3]
                        };
                    }
                }];

            expect(typeof featuresFilterFunction).to.be.equals("function");
            expect(featuresFilterFunction(features).length).to.be.equals(1);
            expect(featuresFilterFunction(features)[0].id).to.be.equals("1");
        });
    });
    describe("getPropertyname", () => {
        it("getPropertyname shall return joined proertyNames or empty string", function () {
            attributes.propertyNames = ["app:plan", "app:name"];
            const oafLayer = new OAFLayer(attributes);
            let propertyname = oafLayer.getPropertyname(attributes);

            expect(propertyname).to.be.equals("app:plan,app:name");

            attributes.propertyNames = [];
            propertyname = oafLayer.getPropertyname(attributes);
            expect(propertyname).to.be.equals("");
            attributes.propertyNames = undefined;
            propertyname = oafLayer.getPropertyname(attributes);
            expect(propertyname).to.be.equals("");
            attributes.propertyNames = undefined;
            propertyname = oafLayer.getPropertyname(attributes);
            expect(propertyname).to.be.equals("");
        });
    });
    describe("getStyleFunction", () => {
        it("initStyle shall be called on creation and call createStyle if styleListLoaded=true", function () {
            const createStyleSpy = sinon.spy(OAFLayer.prototype, "createStyle");

            store.getters = {
                styleListLoaded: true
            };
            attributes.styleId = "styleId";
            new OAFLayer(attributes);

            expect(createStyleSpy.calledOnce).to.be.true;
        });
        it("initStyle shall be called on creation and not call createStyle if styleListLoaded=false", function () {
            const createStyleSpy = sinon.spy(OAFLayer.prototype, "createStyle");

            store.getters = {
                styleListLoaded: false
            };
            attributes.styleId = "styleId";
            new OAFLayer(attributes);

            expect(createStyleSpy.notCalled).to.be.true;
        });

        it("createStyle shall return a function", function () {
            let oAFLayer = null,
                styleFunction = null;

            sinon.stub(styleList, "returnStyleObject").returns(true);
            attributes.styleId = "styleId";
            oAFLayer = new OAFLayer(attributes);
            oAFLayer.createStyle(attributes);
            styleFunction = oAFLayer.getStyleFunction();

            expect(styleFunction).not.to.be.null;
            expect(typeof styleFunction).to.be.equals("function");
        });
    });
    describe("updateSource", () => {
        it("updateSource shall refresh source if 'sourceUpdated' is false", function () {
            const oafLayer = new OAFLayer(attributes),
                layer = oafLayer.get("layer"),
                spy = sinon.spy(layer.getSource(), "refresh");

            expect(oafLayer.get("sourceUpdated")).to.be.false;
            oafLayer.updateSource();
            expect(spy.calledOnce).to.be.true;
            expect(oafLayer.get("sourceUpdated")).to.be.true;
        });
        it("updateSource shall not refresh source if 'sourceUpdated' is true", function () {
            attributes.sourceUpdated = true;
            const oafLayer = new OAFLayer(attributes),
                layer = oafLayer.get("layer"),
                spy = sinon.spy(layer.getSource(), "refresh");

            expect(oafLayer.get("sourceUpdated")).to.be.true;
            oafLayer.updateSource();
            expect(spy.notCalled).to.be.true;
            expect(oafLayer.get("sourceUpdated")).to.be.true;
        });
    });
    describe("functions for features", () => {
        beforeEach(() => {
            sinon.stub(styleList, "returnStyleObject").returns(true);
            sinon.stub(getGeometryTypeFromService, "getGeometryTypeFromOAF").returns(true);
            featuresToShow.forEach((feature) => {
                feature.setStyle(() => null);
            });
        });

        afterEach(() => {
            sinon.restore();
        });

        it("hideAllFeatures", function () {
            const oafLayer = new OAFLayer(attributes),
                layer = oafLayer.get("layer"),
                clearStub = sinon.stub(layer.getSource(), "clear"),
                addFeaturesStub = sinon.stub(layer.getSource(), "addFeatures");

            sinon.stub(layer.getSource(), "getFeatures").returns(featuresToShow);

            oafLayer.hideAllFeatures();

            expect(oafLayer.get("layer").getSource().getFeatures().length).to.be.equals(3);
            expect(clearStub.calledTwice).to.be.true;
            expect(addFeaturesStub.calledTwice).to.be.true;
            expect(typeof style1).to.be.equals("function");
            expect(style1()).to.be.null;
            expect(typeof style2).to.be.equals("function");
            expect(style2()).to.be.null;
            expect(typeof style3).to.be.equals("function");
            expect(style3()).to.be.null;

        });
        it("showAllFeatures", function () {
            sinon.stub(createStyle, "createStyle").returns(new Style());
            const oafLayer = new OAFLayer(attributes),
                layer = oafLayer.get("layer");

            oafLayer.createStyle(attributes);
            sinon.stub(layer.getSource(), "getFeatures").returns(featuresToShow);
            oafLayer.showAllFeatures();

            expect(oafLayer.get("layer").getSource().getFeatures().length).to.be.equals(3);
            expect(typeof style1).to.be.equals("object");
            expect(style1).not.to.be.null;
            expect(typeof style2).to.be.equals("object");
            expect(style2).not.to.be.null;
            expect(typeof style3).to.be.equals("object");
            expect(style3).not.to.be.null;
        });
        it("showFeaturesByIds", function () {
            sinon.stub(createStyle, "createStyle").returns(new Style());
            const oafLayer = new OAFLayer(attributes),
                layer = oafLayer.get("layer"),
                clearStub = sinon.stub(layer.getSource(), "clear");

            sinon.stub(layer.getSource(), "addFeatures");
            sinon.stub(layer.getSource(), "getFeatures").returns(featuresToShow);
            sinon.stub(layer.getSource(), "getFeatureById").returns(featuresToShow[0]);
            sinon.stub(oafLayer, "hideAllFeatures");
            oafLayer.showFeaturesByIds(["1"]);

            expect(oafLayer.get("layer").getSource().getFeatures().length).to.be.equals(3);
            expect(typeof style1).to.be.equals("function");
            expect(style1).not.to.be.null;
            expect(typeof style2).to.be.equals("function");
            expect(style2()).to.be.null;
            expect(typeof style3).to.be.equals("function");
            expect(style3()).to.be.null;
            expect(clearStub.calledOnce).to.be.true;
        });
    });
    describe("functions for styling", () => {
        it("getStyleAsFunction shall return a function", function () {
            const oafLayer = new OAFLayer(attributes);

            /* eslint-disable-next-line require-jsdoc */
            function styleFn () {
                return "test";
            }

            let ret = oafLayer.getStyleAsFunction(styleFn);

            expect(typeof ret).to.be.equals("function");
            expect(ret()).to.be.equals("test");

            ret = oafLayer.getStyleAsFunction("test");
            expect(typeof ret).to.be.equals("function");
            expect(ret()).to.be.equals("test");
        });
        it("styling shall set style", function () {
            const oafLayer = new OAFLayer(attributes);

            /* eslint-disable-next-line require-jsdoc */
            function styleFn () {
                return "test";
            }
            oafLayer.set("style", styleFn);

            oafLayer.styling();
            expect(typeof oafLayer.get("layer").getStyle()).to.be.equals("function");
            expect(oafLayer.get("layer").getStyle()()).to.be.equals("test");
        });
    });
    describe("Use WebGL renderer", () => {
        it("Should create the layer with WebGL methods, if renderer: \"webgl\" is set", function () {
            const
                geojsonLayer = new OAFLayer({...attributes, renderer: "webgl"}),
                layer = geojsonLayer.get("layer");

            expect(geojsonLayer.isDisposed).to.equal(webgl.isDisposed);
            expect(geojsonLayer.setIsSelected).to.equal(webgl.setIsSelected);
            expect(geojsonLayer.hideAllFeatures).to.equal(webgl.hideAllFeatures);
            expect(geojsonLayer.showAllFeatures).to.equal(webgl.showAllFeatures);
            expect(geojsonLayer.showFeaturesByIds).to.equal(webgl.showFeaturesByIds);
            expect(geojsonLayer.setStyle).to.equal(webgl.setStyle);
            expect(geojsonLayer.styling).to.equal(webgl.setStyle);
            expect(geojsonLayer.source).to.equal(layer.getSource());
            expect(layer.get("isPointLayer")).to.not.be.undefined;
        });
    });
});
