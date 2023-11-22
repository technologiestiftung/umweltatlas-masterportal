import Map from "ol/Map";
import View from "ol/View";
import VectorSource from "ol/source/Vector.js";
import VectorLayer from "ol/layer/Vector.js";
import Cluster from "ol/source/Cluster.js";
import {WFS} from "ol/format.js";
import {expect} from "chai";
import sinon from "sinon";
import WfsLayer from "../../wfs";
import store from "../../../../app-store";
import {Style} from "ol/style.js";
import styleList from "@masterportal/masterportalapi/src/vectorStyle/styleList.js";
import createStyle from "@masterportal/masterportalapi/src/vectorStyle/createStyle.js";
import getGeometryTypeFromService from "@masterportal/masterportalapi/src/vectorStyle/lib/getGeometryTypeFromService";
import webgl from "../../renderer/webgl";

describe("src/core/layers/wfs.js", () => {
    const consoleWarn = console.warn;
    let attributes;

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
        i18next.init({
            lng: "cimode",
            debug: false
        });
    });
    beforeEach(() => {
        sinon.stub(console, "error");

        attributes = {
            url: "https://url.de",
            name: "wfsTestLayer",
            id: "id",
            typ: "wfs",
            version: "2.0.0",
            gfiTheme: "gfiTheme",
            isChildLayer: false,
            transparent: false,
            isSelected: false,
            featureNS: "http://www.deegree.org/app",
            featureType: "krankenhaeuser_hh"
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
        it("createLayer shall create an ol.VectorLayer with source and style and WFS-format", function () {
            const wfsLayer = new WfsLayer(attributes),
                layer = wfsLayer.get("layer");

            expect(layer).to.be.an.instanceof(VectorLayer);
            expect(layer.getSource()).to.be.an.instanceof(VectorSource);
            expect(layer.getSource().getFormat()).to.be.an.instanceof(WFS);
            expect(typeof layer.getStyleFunction()).to.be.equals("function");
            expect(layer.get("id")).to.be.equals(attributes.id);
            expect(layer.get("name")).to.be.equals(attributes.name);
            expect(layer.get("gfiTheme")).to.be.equals(attributes.gfiTheme);
        });
        it("createLayer shall create an ol.VectorLayer with cluster-source", function () {
            attributes.clusterDistance = 60;
            const wfsLayer = new WfsLayer(attributes),
                layer = wfsLayer.get("layer");

            expect(layer).to.be.an.instanceof(VectorLayer);
            expect(layer.getSource()).to.be.an.instanceof(Cluster);
            expect(layer.getSource().getDistance()).to.be.equals(attributes.clusterDistance);
            expect(layer.getSource().getSource().getFormat()).to.be.an.instanceof(WFS);
            expect(typeof layer.getStyleFunction()).to.be.equals("function");
        });
        it("createLayer with isSelected=true shall set layer visible", function () {
            attributes.isSelected = true;
            const wfsLayer = new WfsLayer(attributes),
                layer = wfsLayer.get("layer");

            expect(layer).to.be.an.instanceof(VectorLayer);
            expect(layer.getSource()).to.be.an.instanceof(VectorSource);
            expect(wfsLayer.get("isVisibleInMap")).to.be.true;
            expect(wfsLayer.get("layer").getVisible()).to.be.true;
        });
        it("createLayer with isSelected=false shall set layer not visible", function () {
            attributes.isSelected = false;
            const wfsLayer = new WfsLayer(attributes),
                layer = wfsLayer.get("layer");

            expect(layer).to.be.an.instanceof(VectorLayer);
            expect(layer.getSource()).to.be.an.instanceof(VectorSource);
            expect(wfsLayer.get("isVisibleInMap")).to.be.false;
            expect(wfsLayer.get("layer").getVisible()).to.be.false;
        });
    });
    describe("getFeaturesFilterFunction", () => {
        it("getFeaturesFilterFunction shall filter getGeometry", function () {
            const wfsLayer = new WfsLayer(attributes),
                featuresFilterFunction = wfsLayer.getFeaturesFilterFunction(attributes),
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
            const wfsLayer = new WfsLayer(attributes),
                featuresFilterFunction = wfsLayer.getFeaturesFilterFunction(attributes),
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
            const wfsLayer = new WfsLayer(attributes);
            let propertyname = wfsLayer.getPropertyname(attributes);

            expect(propertyname).to.be.equals("app:plan,app:name");

            attributes.propertyNames = [];
            propertyname = wfsLayer.getPropertyname(attributes);
            expect(propertyname).to.be.equals("");
            attributes.propertyNames = undefined;
            propertyname = wfsLayer.getPropertyname(attributes);
            expect(propertyname).to.be.equals("");
            attributes.propertyNames = undefined;
            propertyname = wfsLayer.getPropertyname(attributes);
            expect(propertyname).to.be.equals("");
        });
    });
    describe("getStyleFunction", () => {
        it("initStyle shall be called on creation and call createStyle if styleListLoaded=true", function () {
            const createStyleSpy = sinon.spy(WfsLayer.prototype, "createStyle");

            store.getters = {
                styleListLoaded: true
            };
            attributes.styleId = "styleId";
            new WfsLayer(attributes);

            expect(createStyleSpy.calledOnce).to.be.true;
        });
        it("initStyle shall be called on creation and not call createStyle if styleListLoaded=false", function () {
            const createStyleSpy = sinon.spy(WfsLayer.prototype, "createStyle");

            store.getters = {
                styleListLoaded: false
            };
            attributes.styleId = "styleId";
            new WfsLayer(attributes);

            expect(createStyleSpy.notCalled).to.be.true;
        });

        it("createStyle shall return a function", function () {
            let layer = null,
                styleFunction = null;

            sinon.stub(styleList, "returnStyleObject").returns(true);
            attributes.styleId = "styleId";
            layer = new WfsLayer(attributes);
            layer.createStyle(attributes);
            styleFunction = layer.getStyleFunction();

            expect(styleFunction).not.to.be.null;
            expect(typeof styleFunction).to.be.equals("function");
        });
    });
    describe("updateSource", () => {
        it("updateSource shall refresh source if 'sourceUpdated' is false", function () {
            const wfsLayer = new WfsLayer(attributes),
                layer = wfsLayer.get("layer"),
                spy = sinon.spy(layer.getSource(), "refresh");

            expect(wfsLayer.get("sourceUpdated")).to.be.false;
            wfsLayer.updateSource();
            expect(spy.calledOnce).to.be.true;
            expect(wfsLayer.get("sourceUpdated")).to.be.true;
        });
        it("updateSource shall not refresh source if 'sourceUpdated' is true", function () {
            attributes.sourceUpdated = true;
            const wfsLayer = new WfsLayer(attributes),
                layer = wfsLayer.get("layer"),
                spy = sinon.spy(layer.getSource(), "refresh");

            expect(wfsLayer.get("sourceUpdated")).to.be.true;
            wfsLayer.updateSource();
            expect(spy.notCalled).to.be.true;
            expect(wfsLayer.get("sourceUpdated")).to.be.true;
        });
    });
    describe("createLegend", () => {
        it("createLegend shall set legend", function () {
            attributes.legendURL = "https://legendUrl";
            const wfsLayer = new WfsLayer(attributes);

            expect(wfsLayer.get("legendURL")).to.be.deep.equals(attributes.legendURL);
        });
        it("createLegend shall set not secured legend", function () {
            attributes.legend = true;
            const wfsLayer = new WfsLayer(attributes);

            expect(wfsLayer.get("legendUrl")).not.to.be.true;
        });
        it("createLegend shall set secured legend", function () {
            attributes.legend = true;
            attributes.isSecured = true;
            const wfsLayer = new WfsLayer(attributes);

            expect(wfsLayer.get("legendUrl")).not.to.be.true;
        });
    });
    describe("filterUniqueLegendInfo", () => {
        it("returns uniqueLegendInfo for several features with same condition property (same style)", () => {
            const wfsLayer = new WfsLayer(attributes),
                attributes1 = {id: 1, kategorie: "Bewässerungsanlagen", name: ""},
                attributes2 = {id: 2, kategorie: "Bewässerungsanlagen", name: "Ludwigsluster Kanal"},
                attributes3 = {id: 2, kategorie: "Brücken", name: "Lustige Brücke"},
                features = [{
                    attribute: attributes1,
                    get: (key) => {
                        return attributes1[key];
                    }
                },
                {
                    attribute: attributes2,
                    get: (key) => {
                        return attributes2[key];
                    }
                },
                {
                    attribute: attributes3,
                    get: (key) => {
                        return attributes3[key];
                    }
                }],
                rules = [{
                    conditions: {
                        properties: {
                            kategorie: "Bewässerungsanlagen"
                        }
                    },
                    style: {
                        imageName: "kanal.png"
                    }
                },
                {
                    conditions: {
                        properties: {
                            kategorie: "Brücken"
                        }
                    },
                    style: {
                        imageName: "bruecke.png"
                    }
                }],
                legendInfos = [
                    {
                        geometryType: "Point",
                        id: "Point%7B%22properties%22%3A%7B%22kategorie%22%3A%22Bew%C3%A4sserungsanlagen%22%7D%7D",
                        label: "Bewässerungsanlagen",
                        styleObject: {}
                    },
                    {
                        geometryType: "Point",
                        id: "Point%7B%22properties%22%3A%7B%22kategorie%22%3A%22Br%C3%BCcken%22%7D%7D",
                        label: "Brücken",
                        styleObject: {}
                    }
                ],
                expectedUniqueLegendInfo = [{
                    geometryType: "Point",
                    id: "Point%7B%22properties%22%3A%7B%22kategorie%22%3A%22Bew%C3%A4sserungsanlagen%22%7D%7D",
                    label: "Bewässerungsanlagen",
                    styleObject: {}
                },
                {
                    geometryType: "Point",
                    id: "Point%7B%22properties%22%3A%7B%22kategorie%22%3A%22Br%C3%BCcken%22%7D%7D",
                    label: "Brücken",
                    styleObject: {}
                }];

            expect(wfsLayer.filterUniqueLegendInfo(features, rules, legendInfos)).to.deep.equal(expectedUniqueLegendInfo);
            expect(wfsLayer.filterUniqueLegendInfo(features, rules, legendInfos).length).to.not.deep.equal(features.length);
        });
        it("return uniqueLegendInfo for feature condition property that match legendinformation", () => {
            const wfsLayer = new WfsLayer(attributes),
                attributes1 = {id: 1, Schulform: "Grundschule", name: ""},
                attributes2 = {id: 2, Schulform: "Regionale Schule", name: "Ludwigsluster Kanal"},
                attributes3 = {id: 3, Schulform: "Waldorfschule", name: "Lustige Brücke"},
                features = [{
                    attribute: attributes1,
                    get: (key) => {
                        return attributes1[key];
                    }
                },
                {
                    attribute: attributes2,
                    get: (key) => {
                        return attributes2[key];
                    }
                },
                {
                    attribute: attributes3,
                    get: (key) => {
                        return attributes3[key];
                    }
                }],
                rules = [{
                    conditions: {
                        properties: {
                            Schulform: "Grundschule"
                        }
                    },
                    style: {
                        imageName: "kanal.png"
                    }
                },
                {
                    conditions: {
                        properties: {
                            Schulform: "Regionale Schule"
                        }
                    },
                    style: {
                        imageName: "bruecke.png"
                    }
                },
                {
                    conditions: {
                        properties: {
                            Schulform: "Gymnasium"
                        }
                    },
                    style: {
                        imageName: "bruecke.png"
                    }
                },
                {
                    conditions: {
                        properties: {
                            Schulform: "Förderschule"
                        }
                    },
                    style: {
                        imageName: "bruecke.png"
                    }
                },
                {
                    conditions: {
                        properties: {
                            Schulform: "Waldorfschule"
                        }
                    },
                    style: {
                        imageName: "bruecke.png"
                    }
                }],
                legendInfos = [
                    {
                        geometryType: "Point",
                        id: "1",
                        label: "Grundschule",
                        styleObject: {}
                    },
                    {
                        geometryType: "Point",
                        id: "2",
                        label: "Regionale Schule",
                        styleObject: {}
                    },
                    {
                        geometryType: "Point",
                        id: "3",
                        label: "Gymnasium",
                        styleObject: {}
                    },
                    {
                        geometryType: "Point",
                        id: "4",
                        label: "Förderschule",
                        styleObject: {}
                    },
                    {
                        geometryType: "Point",
                        id: "5",
                        label: "Waldorfschule",
                        styleObject: {}
                    }
                ],
                expectedUniqueLegendInfo = [{
                    geometryType: "Point",
                    id: "1",
                    label: "Grundschule",
                    styleObject: {}
                },
                {
                    geometryType: "Point",
                    id: "2",
                    label: "Regionale Schule",
                    styleObject: {}
                },
                {
                    geometryType: "Point",
                    id: "5",
                    label: "Waldorfschule",
                    styleObject: {}
                }];

            expect(wfsLayer.filterUniqueLegendInfo(features, rules, legendInfos)).to.deep.equal(expectedUniqueLegendInfo);
            expect(wfsLayer.filterUniqueLegendInfo(features, rules, legendInfos).length).to.deep.equal(3);
            expect(wfsLayer.filterUniqueLegendInfo(features, rules, legendInfos).length).to.deep.equal(features.length);
        });
        it("return uniqueLegendInfo for feature condition property (with first letter upper case) that match legendinformation (first letter lower case", () => {
            const wfsLayer = new WfsLayer(attributes),
                attributes1 = {id: 1, Kategorie: "Bewässerungsanlagen", name: ""},
                features = [{
                    attribute: attributes1,
                    get: (key) => {
                        return attributes1[key];
                    }
                }],
                rules = [{
                    conditions: {
                        properties: {
                            kategorie: "Bewässerungsanlagen"
                        }
                    },
                    style: {
                        imageName: "kanal.png"
                    }
                },
                {
                    conditions: {
                        properties: {
                            kategorie: "Brücken"
                        }
                    },
                    style: {
                        imageName: "bruecke.png"
                    }
                }],
                legendInfos = [
                    {
                        geometryType: "Point",
                        id: "Point%7B%22properties%22%3A%7B%22kategorie%22%3A%22Bew%C3%A4sserungsanlagen%22%7D%7D",
                        label: "Bewässerungsanlagen",
                        styleObject: {}
                    }
                ],
                expectedUniqueLegendInfo = [{
                    geometryType: "Point",
                    id: "Point%7B%22properties%22%3A%7B%22kategorie%22%3A%22Bew%C3%A4sserungsanlagen%22%7D%7D",
                    label: "Bewässerungsanlagen",
                    styleObject: {}
                }];

            expect(wfsLayer.filterUniqueLegendInfo(features, rules, legendInfos)).to.deep.equal(expectedUniqueLegendInfo);
        });
        it("should return legendInfos with label, if legendValue is exist", () => {
            const wfsLayer = new WfsLayer(attributes),
                attributes1 = {id: 1, ID_SYMBOL: "3", name: "ASN, Wertstoffhof Nord"},
                features = [{
                    attribute: attributes1,
                    get: (key) => {
                        return attributes1[key];
                    }
                }],
                rules = [{
                    conditions: {
                        properties: {
                            ID_SYMBOL: "3"
                        }
                    },
                    style: {
                        clusterImageName: "amt_stadt_nuernberg.png",
                        imageName: "amt_stadt_nuernberg.png",
                        legendValue: "Städtische Ämter"
                    }
                },
                {
                    conditions: {
                        properties: {
                            kategorie: "Brücken"
                        }
                    },
                    style: {
                        imageName: "bruecke.png"
                    }
                }],
                legendInfos = [
                    {
                        geometryType: "Point",
                        id: "Point%7B%22properties%22%3A%7B%22ID_SYMBOL%22%3A3%7D%7D",
                        label: "Städtische Ämter",
                        styleObject: {}
                    }
                ],
                expectedUniqueLegendInfo = [
                    {
                        geometryType: "Point",
                        id: "Point%7B%22properties%22%3A%7B%22ID_SYMBOL%22%3A3%7D%7D",
                        label: "Städtische Ämter",
                        styleObject: {}
                    }
                ];

            expect(wfsLayer.filterUniqueLegendInfo(features, rules, legendInfos)).to.deep.equal(expectedUniqueLegendInfo);
        });
    });
    describe("functions for features", () => {
        let style1 = null,
            style2 = null,
            style3 = null;
        const features = [{
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

        it("hideAllFeatures", function () {
            const wfsLayer = new WfsLayer(attributes),
                layer = wfsLayer.get("layer"),
                clearStub = sinon.stub(layer.getSource(), "clear"),
                addFeaturesStub = sinon.stub(layer.getSource(), "addFeatures");

            sinon.stub(layer.getSource(), "getFeatures").returns(features);

            wfsLayer.hideAllFeatures();

            expect(wfsLayer.get("layer").getSource().getFeatures().length).to.be.equals(3);
            expect(clearStub.calledOnce).to.be.true;
            expect(addFeaturesStub.calledOnce).to.be.true;
            expect(typeof style1).to.be.equals("function");
            expect(style1()).to.be.null;
            expect(typeof style2).to.be.equals("function");
            expect(style2()).to.be.null;
            expect(typeof style3).to.be.equals("function");
            expect(style3()).to.be.null;

        });
        it("showAllFeatures", function () {
            sinon.stub(styleList, "returnStyleObject").returns(true);
            sinon.stub(createStyle, "createStyle").returns(new Style());
            sinon.stub(getGeometryTypeFromService, "getGeometryTypeFromWFS").returns(new Promise(resolve => {
                resolve({});
            }));
            const wfsLayer = new WfsLayer(attributes),
                layer = wfsLayer.get("layer");

            wfsLayer.createStyle(attributes);
            sinon.stub(layer.getSource(), "getFeatures").returns(features);
            wfsLayer.showAllFeatures();

            expect(wfsLayer.get("layer").getSource().getFeatures().length).to.be.equals(3);
            expect(typeof style1).to.be.equals("object");
            expect(style1).not.to.be.null;
            expect(typeof style2).to.be.equals("object");
            expect(style2).not.to.be.null;
            expect(typeof style3).to.be.equals("object");
            expect(style3).not.to.be.null;

        });
        it("showFeaturesByIds", function () {
            sinon.stub(styleList, "returnStyleObject").returns(true);
            sinon.stub(createStyle, "createStyle").returns(new Style());
            sinon.stub(getGeometryTypeFromService, "getGeometryTypeFromWFS").returns(new Promise(resolve => {
                resolve({});
            }));

            const wfsLayer = new WfsLayer(attributes),
                layer = wfsLayer.get("layer"),
                clearStub = sinon.stub(layer.getSource(), "clear");

            wfsLayer.createStyle(attributes);
            sinon.stub(layer.getSource(), "addFeatures");
            sinon.stub(layer.getSource(), "getFeatures").returns(features);
            sinon.stub(layer.getSource(), "getFeatureById").returns(features[0]);
            wfsLayer.showFeaturesByIds(["1"]);

            expect(wfsLayer.get("layer").getSource().getFeatures().length).to.be.equals(3);
            expect(typeof style1).to.be.equals("object");
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
            const wfsLayer = new WfsLayer(attributes);

            /* eslint-disable-next-line require-jsdoc */
            function styleFn () {
                return "test";
            }

            let ret = wfsLayer.getStyleAsFunction(styleFn);

            expect(typeof ret).to.be.equals("function");
            expect(ret()).to.be.equals("test");

            ret = wfsLayer.getStyleAsFunction("test");
            expect(typeof ret).to.be.equals("function");
            expect(ret()).to.be.equals("test");
        });
        it("styling shall set style", function () {
            const wfsLayer = new WfsLayer(attributes);

            /* eslint-disable-next-line require-jsdoc */
            function styleFn () {
                return "test";
            }
            wfsLayer.set("style", styleFn);

            wfsLayer.styling();
            expect(typeof wfsLayer.get("layer").getStyle()).to.be.equals("function");
            expect(wfsLayer.get("layer").getStyle()()).to.be.equals("test");
        });
    });
    describe("Use WebGL renderer", () => {
        it("Should create the layer with WebGL methods, if renderer: \"webgl\" is set", function () {
            const
                geojsonLayer = new WfsLayer({...attributes, renderer: "webgl"}),
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
