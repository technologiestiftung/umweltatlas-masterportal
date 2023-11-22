import BuildSpec from "../../../utils/buildSpec";
import Polygon from "ol/geom/Polygon";
import {Fill, Stroke} from "ol/style";
import {expect} from "chai";
import sinon from "sinon";
import createTestFeatures from "./testHelper";
import Feature from "ol/Feature.js";

describe("src/modules/tools/print/utils/buildSpec.buildStyle", function () {
    let buildSpec,
        polygonFeatures,
        getStylingRules,
        getFeatureStyle,
        getStyleAttributes,
        buildPolygonStyle;
    const attr = {
            "layout": "A4 Hochformat",
            "outputFormat": "pdf",
            "attributes": {
                "title": "TestTitel",
                "map": {
                    "dpi": 96,
                    "projection": "EPSG:25832",
                    "center": [561210, 5932600],
                    "scale": 40000
                }
            }
        },
        layer = {
            values_: {
                id: "1711"
            },
            get: sinon.stub(),
            getSource: sinon.stub()
        },
        geometry = new Polygon([[[0, 0], [1000, 0], [0, 1000], [0, 0]]]),
        fill = new Fill({
            color: "#4b4bff"
        }),
        stroke = new Stroke({
            color: "#000000",
            width: 1.25
        }),
        style = {
            getGeometryFunction: () => () => {
                return (
                    geometry
                );
            },
            getFill: () => fill,
            getStroke: () => stroke,
            getColor: () => "#4b4bff",
            getWidth: () => 1,
            getText: () => null
        },
        polygonStyleObj = {
            fillColor: "#4b4bff",
            fillOpacity: 1,
            strokeColor: "#000000",
            strokeOpacity: 1,
            strokeWidth: 1.25,
            type: "polygon"
        };

    before(() => {
        buildSpec = BuildSpec;
        getStylingRules = buildSpec.getStylingRules;
        getFeatureStyle = buildSpec.getFeatureStyle;
        getStyleAttributes = buildSpec.getStyleAttributes;
        buildPolygonStyle = buildSpec.buildPolygonStyle;
        buildSpec.setAttributes(attr);
        polygonFeatures = createTestFeatures("resources/testFeaturesBewohnerparkgebiete.xml");
    });

    afterEach(() => {
        buildSpec.getStylingRules = getStylingRules;
        buildSpec.getFeatureStyle = getFeatureStyle;
        buildSpec.getStyleAttributes = getStyleAttributes;
        buildSpec.buildPolygonStyle = buildPolygonStyle;
        sinon.restore();
    });

    describe("buildStyle", function () {
        it("buildStyle shall return a style for the style attribute", function () {
            let mapfishStyleObject = null,
                styleObject = null;
                // stylingRule: bewirtschaftungsart='Parkschein, Bewohner mit Ausweis frei_0'
            const stylingRule = "bewirtschaftungsart=" + polygonFeatures[0].values_.bewirtschaftungsart + "_0";

            buildSpec.getStylingRules = () => stylingRule;
            buildSpec.getFeatureStyle = () => [style];
            buildSpec.getStyleAttributes = () => ["bewirtschaftungsart"];
            buildSpec.buildPolygonStyle = () => polygonStyleObj;

            mapfishStyleObject = buildSpec.buildStyle(layer, polygonFeatures, []);
            styleObject = mapfishStyleObject[stylingRule];

            expect(mapfishStyleObject.version).to.be.equal("2");
            expect(styleObject).to.be.an("object");
            expect(styleObject.symbolizers).to.be.an("array");
            expect(styleObject.symbolizers.length).to.be.equal(1);
            expect(styleObject.symbolizers[0]).to.be.deep.equal(polygonStyleObj);
        });
        it("buildStyle shall return a style for the style attribute", function () {
            let mapfishStyleObject = null,
                styleObject = null;

            const stylingRule = "[Datastreams0Observations0result=1_0]",
                testFeature = new Feature({
                    Datastreams: [{
                        Observations: [{
                            result: 0
                        }]
                    }],
                    geometry: new Polygon([[[0, 0], [0, 1], [1, 1], [0, 0]]])
                });

            buildSpec.getStylingRules = () => stylingRule;
            buildSpec.getFeatureStyle = () => [style];
            buildSpec.getStyleAttributes = () => ["@Datastreams.0.Observations.0.result"];
            buildSpec.buildPolygonStyle = () => polygonStyleObj;

            mapfishStyleObject = buildSpec.buildStyle(layer, [testFeature], []);
            styleObject = mapfishStyleObject[stylingRule];

            expect(mapfishStyleObject.version).to.be.equal("2");
            expect(styleObject).to.be.an("object");
            expect(styleObject.symbolizers).to.be.an("array");
            expect(styleObject.symbolizers.length).to.be.equal(1);
            expect(styleObject.symbolizers[0]).to.be.deep.equal(polygonStyleObj);
        });
        it("buildStyle shall return a style for the style attribute", function () {
            let mapfishStyleObject = null,
                styleObject = null;

            const stylingRule = "[default='CIRCLESEGMENTS_charging_charging_0']",
                testFeature = new Feature({
                    geometry: new Polygon([[[0, 0], [0, 1], [1, 1], [0, 0]]])
                }),
                circleSegmentStyle = {
                    "geometry_": null,
                    "fill_": null,
                    "image_": {
                        "opacity_": 1,
                        "rotateWithView_": false,
                        "rotation_": 0,
                        "scale_": 1,
                        "scaleArray_": [
                            1,
                            1
                        ],
                        "displacement_": [
                            0,
                            0
                        ],
                        "anchor_": [
                            0.5,
                            0.5
                        ],
                        "normalizedAnchor_": null,
                        "anchorOrigin_": "top-left",
                        "anchorXUnits_": "fraction",
                        "anchorYUnits_": "fraction",
                        "crossOrigin_": "anonymous",
                        "imgSize_": [
                            58,
                            58
                        ],
                        "color_": null,
                        "iconImage_": {
                            "disposed": false,
                            "pendingRemovals_": {},
                            "dispatching_": {},
                            "listeners_": {},
                            "hitDetectionImage_": {},
                            "image_": {},
                            "crossOrigin_": "anonymous",
                            "canvas_": {},
                            "color_": null,
                            "unlisten_": null,
                            "imageState_": 2,
                            "size_": [
                                58,
                                58
                            ],
                            "src_": "data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D'58'%20height%3D'58'%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20xmlns%3Axlink%3D'http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink'%3E%3Ccircle%20cx%3D'29'%20cy%3D'29'%20r%3D'21'%20stroke%3D'%23ffffff'%20stroke-width%3D'3'%20fill%3D'%23ffffff'%20fill-opacity%3D'1'%2F%3E%3Cpath%20fill%3D'none'%20stroke-width%3D'3'%20stroke%3D'%23dc0000'%20d%3D'M%2049.920088659926655%2027.16972940229918%20A%2021%2021%200%200%200%208.079911340073345%2027.16972940229918'%2F%3E%3Cpath%20fill%3D'none'%20stroke-width%3D'3'%20stroke%3D'%2300dc00'%20d%3D'M%208.079911340073345%2030.830270597700817%20A%2021%2021%200%200%200%2049.920088659926655%2030.830270597700824'%2F%3E%3C%2Fsvg%3E",
                            "tainted_": false
                        },
                        "offset_": [
                            0,
                            0
                        ],
                        "offsetOrigin_": "top-left",
                        "origin_": null,
                        "size_": null
                    },
                    "renderer_": null,
                    "hitDetectionRenderer_": null,
                    "stroke_": null,
                    "text_": null,
                    "type": "CIRCLESEGMENTS",
                    "scalingAttribute": "available | charging",
                    getGeometryFunction: () => () => {
                        return (
                            geometry
                        );
                    },
                    getFill: () => fill,
                    getStroke: () => stroke,
                    getColor: () => "#4b4bff",
                    getWidth: () => 1,
                    getText: () => null
                };

            buildSpec.getStylingRules = () => stylingRule;
            buildSpec.getFeatureStyle = () => [circleSegmentStyle];
            buildSpec.getStyleAttributes = () => ["default"];
            buildSpec.buildPolygonStyle = () => polygonStyleObj;

            mapfishStyleObject = buildSpec.buildStyle(layer, [testFeature], []);
            styleObject = mapfishStyleObject[stylingRule];

            expect(mapfishStyleObject.version).to.be.equal("2");
            expect(styleObject).to.be.an("object");
            expect(styleObject.symbolizers).to.be.an("array");
            expect(styleObject.symbolizers.length).to.be.equal(1);
            expect(styleObject.symbolizers[0]).to.be.deep.equal(polygonStyleObj);
        });
        it("buildStyle shall return a style for the style attribute", function () {
            let mapfishStyleObject = null,
                styleObject = null;

            const stylingRule = "[default='imageStyle_0']",
                testFeature = new Feature({
                    geometry: new Polygon([[[0, 0], [0, 1], [1, 1], [0, 0]]])
                }),
                imageStyleStyle = {
                    "geometry_": null,
                    "fill_": null,
                    "image_": {
                        "opacity_": 1,
                        "rotateWithView_": false,
                        "rotation_": 0,
                        "scale_": 0.9,
                        "scaleArray_": [
                            0.9,
                            0.9
                        ],
                        "displacement_": [
                            0,
                            0
                        ],
                        "anchor_": [
                            0.5,
                            0.5
                        ],
                        "normalizedAnchor_": null,
                        "anchorOrigin_": "top-left",
                        "anchorXUnits_": "fraction",
                        "anchorYUnits_": "fraction",
                        "crossOrigin_": "anonymous",
                        "imgSize_": "",
                        "color_": null,
                        "iconImage_": {
                            "disposed": false,
                            "pendingRemovals_": {},
                            "dispatching_": {},
                            "listeners_": {},
                            "hitDetectionImage_": {},
                            "image_": {},
                            "crossOrigin_": "anonymous",
                            "canvas_": {},
                            "color_": null,
                            "unlisten_": null,
                            "imageState_": 2,
                            "size_": [
                                60,
                                60
                            ],
                            "src_": "https://geodienste.hamburg.de/lgv-config/img/elektro_auto_Transparenz.png",
                            "tainted_": false
                        },
                        "offset_": [
                            0,
                            0
                        ],
                        "offsetOrigin_": "top-left",
                        "origin_": null,
                        "size_": null
                    },
                    "renderer_": null,
                    "hitDetectionRenderer_": null,
                    "stroke_": null,
                    "text_": null,
                    "type": "imageStyle",
                    getGeometryFunction: () => () => {
                        return (
                            geometry
                        );
                    },
                    getFill: () => fill,
                    getStroke: () => stroke,
                    getColor: () => "#4b4bff",
                    getWidth: () => 1,
                    getText: () => null
                };

            buildSpec.getStylingRules = () => stylingRule;
            buildSpec.getFeatureStyle = () => [imageStyleStyle];
            buildSpec.getStyleAttributes = () => ["default"];
            buildSpec.buildPolygonStyle = () => polygonStyleObj;

            mapfishStyleObject = buildSpec.buildStyle(layer, [testFeature], []);
            styleObject = mapfishStyleObject[stylingRule];

            expect(mapfishStyleObject.version).to.be.equal("2");
            expect(styleObject).to.be.an("object");
            expect(styleObject.symbolizers).to.be.an("array");
            expect(styleObject.symbolizers.length).to.be.equal(1);
            expect(styleObject.symbolizers[0]).to.be.deep.equal(polygonStyleObj);
        });
    });

});
