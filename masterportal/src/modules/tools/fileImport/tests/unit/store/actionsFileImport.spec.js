/**/
import testAction from "../../../../../../../test/unittests/VueTestUtils";
import actions from "../../../store/actionsFileImport";
import importedState from "../../../store/stateFileImport";
import rawSources from "../../resources/rawSources.js";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import crs from "@masterportal/masterportalapi/src/crs";
import sinon from "sinon/pkg/sinon-esm";
import {expect} from "chai";

const
    {importKML, setFeatureExtents, importGeoJSON} = actions,
    namedProjections = [
        ["EPSG:31467", "+title=Bessel/Gauß-Krüger 3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs"],
        ["EPSG:25832", "+title=ETRS89/UTM 32N +proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"],
        ["EPSG:8395", "+title=ETRS89/Gauß-Krüger 3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=GRS80 +datum=GRS80 +units=m +no_defs"],
        ["EPSG:4326", "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"]
    ],
    rootGetters = {
        "Maps/projectionCode": "EPSG:25832"
    },
    source = new VectorSource(),
    layer = new VectorLayer({
        name: name,
        source: source,
        alwaysOnTop: true
    });
let dispatch;

before(() => {
    crs.registerProjections(namedProjections);

    i18next.init({
        lng: "cimode",
        debug: false
    });
});
beforeEach(() => {
    dispatch = sinon.spy();
    layer.getSource().getFeatures().forEach(feature => layer.getSource().removeFeature(feature));
});

describe("src/modules/tools/fileImport/store/actionsFileImport.js", () => {
    describe("file import - file should add some features to the current draw layer", () => {

        it("preset \"auto\", correct kml file, correct filename", done => {
            const payload = {layer: layer, raw: rawSources[0], filename: "TestFile1.kml"};

            testAction(importKML, payload, importedState, {}, [{
                type: "Alerting/addSingleAlert",
                payload: {
                    category: i18next.t("common:modules.alerting.categories.info"),
                    content: i18next.t("common:modules.tools.fileImport.alertingMessages.success", {filename: payload.filename})},
                dispatch: true
            }], {}, done, {"Maps/projectionCode": "EPSG:25832"});
        });

        it("preset \"auto\", correct kml file, wrong filename", done => {
            const payload = {layer: layer, raw: rawSources[0], filename: "bogus_file.bog"};

            testAction(importKML, payload, importedState, {}, [{
                type: "Alerting/addSingleAlert",
                payload: {
                    category: i18next.t("common:modules.alerting.categories.error"),
                    content: i18next.t("common:modules.tools.fileImport.alertingMessages.missingFormat")
                },
                dispatch: true
            }], {}, done);
        });

        it("preset \"auto\", broken kml file, correct filename", done => {
            const payload = {layer: layer, raw: rawSources[1], filename: "TestFile1.kml"};

            testAction(importKML, payload, importedState, {}, [{
                type: "Alerting/addSingleAlert",
                payload: {
                    category: i18next.t("common:modules.alerting.categories.error"),
                    content: i18next.t("common:modules.tools.fileImport.alertingMessages.missingFileContent")
                },
                dispatch: true
            }], {}, done);
        });

        it("preset \"auto\", empty kml file, correct filename", done => {
            const payload = {layer: layer, raw: "", filename: "TestFile1.kml"};

            testAction(importKML, payload, importedState, {}, [{
                type: "Alerting/addSingleAlert",
                payload: {
                    category: i18next.t("common:modules.alerting.categories.error"),
                    content: i18next.t("common:modules.tools.fileImport.alertingMessages.missingFileContent")
                },
                dispatch: true
            }], {}, done);
        });

        it("preset \"auto\", correct gpx file, correct filename", done => {
            const payload = {layer: layer, raw: rawSources[2], filename: "TestFile1.gpx"};

            testAction(importKML, payload, importedState, {}, [{
                type: "Alerting/addSingleAlert",
                payload: {
                    category: i18next.t("common:modules.alerting.categories.info"),
                    content: i18next.t("common:modules.tools.fileImport.alertingMessages.success", {filename: payload.filename})},
                dispatch: true
            }], {}, done, {"Maps/projectionCode": "EPSG:25832"});
        });

        it("preset \"auto\", correct geojson file, correct filename", done => {
            const payload = {layer: layer, raw: rawSources[3], filename: "TestFile1.json"};

            testAction(importKML, payload, importedState, {}, [{
                type: "Alerting/addSingleAlert",
                payload: {
                    category: i18next.t("common:modules.alerting.categories.info"),
                    content: i18next.t("common:modules.tools.fileImport.alertingMessages.success", {filename: payload.filename})},
                dispatch: true
            }], {}, done, {"Maps/projectionCode": "EPSG:25832"});
        });

        it("preset \"gpx\", correct kml file, correct filename", done => {
            const
                payload = {layer: layer, raw: rawSources[3], filename: "TestFile1.json"},
                tmpState = {...importedState, ...{selectedFiletype: "gpx"}};

            testAction(importKML, payload, tmpState, {}, [{
                type: "Alerting/addSingleAlert",
                payload: {
                    category: i18next.t("common:modules.alerting.categories.error"),
                    content: i18next.t("common:modules.tools.fileImport.alertingMessages.missingFileContent")},
                dispatch: true
            }], {}, done);
        });

        it("adds a text style from the kml file", () => {
            const payload = {layer: layer, raw: "<kml xmlns=\"http://www.opengis.net/kml/2.2\" xmlns:gx=\"http://www.google.com/kml/ext/2.2\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd\"><Placemark><name>Beispieltext</name><Style><LabelStyle><color>ffb87e37</color><scale xmlns=\"\">2</scale></LabelStyle><IconStyle xmlns=\"\"><scale>0</scale><Icon><href>https://localhost:9001/img/tools/draw/circle_blue.svg</href></Icon></IconStyle></Style><ExtendedData><Data name=\"drawState\"/><Data name=\"fromDrawTool\"><value>true</value></Data><Data name=\"invisibleStyle\"/><Data name=\"isOuterCircle\"><value>false</value></Data><Data name=\"isVisible\"><value>true</value></Data><Data name=\"styleId\"><value>1</value></Data></ExtendedData><Point><coordinates>10.003468073834911,53.56393658023316</coordinates></Point></Placemark></kml>", filename: "beispielText.kml"},
                state = {
                    selectedFiletype: "auto",
                    supportedFiletypes: {
                        auto: {
                            caption: "common:modules.tools.fileImport.captions.supportedFiletypes.auto"
                        },
                        kml: {
                            caption: "common:modules.tools.fileImport.captions.supportedFiletypes.kml",
                            rgx: /\.kml$/i
                        }
                    }
                };

            importKML({state, dispatch, rootGetters}, payload);
            expect(dispatch.firstCall.args[0]).to.equal("Alerting/addSingleAlert");
            expect(dispatch.firstCall.args[1]).to.eql({
                category: "modules.alerting.categories.info",
                content: "modules.tools.fileImport.alertingMessages.success"
            });
            expect(dispatch.secondCall.args[0]).to.equal("addImportedFilename");
            expect(dispatch.secondCall.args[1]).to.equal("beispielText.kml");
            expect(layer.getSource().getFeatures().length).to.equal(1);
            expect(layer.getSource().getFeatures()[0].getStyle().getText().getText()).to.equal("Beispieltext");
        });
        it("adds a polygon from the kml file with name and style", () => {
            const payload = {layer: layer, raw: "<kml xmlns:xsd='http://www.w3.org/2001/XMLSchema' xmlns:gx='http://www.google.com/kml/ext/2.2' xmlns:atom='http://www.w3.org/2005/Atom' xmlns='http://www.opengis.net/kml/2.2'><name>buschweide</name><visibility>1</visibility><Folder id='kml_ft_buschweide'><name>buschweide</name><Placemark id='kml_1'><name>kml_1</name><Style><LineStyle><color>ff3f00ff</color></LineStyle><PolyStyle><color>b03f00ff</color></PolyStyle></Style><Polygon><outerBoundaryIs><LinearRing><coordinates>10.0169479414991,53.507748759481,0.0 10.0169396343717,53.5077450559252,0.0 10.0169543081327,53.5077333593708,0.0 10.0168648432591,53.5076934733274,0.0 10.016870441863,53.5076890106434,0.0 10.0175837750914,53.5080070313637,0.0 10.0181240750552,53.5082562219031,0.0 10.0181952638696,53.508272214397,0.0 10.0182545235708,53.508299471994,0.0 10.0184685005412,53.5083780047281,0.0 10.0184794422704,53.5083820386497,0.0 10.0185839462176,53.5084203774366,0.0 10.0186572312231,53.5084412747331,0.0 10.0187568436678,53.5084650943644,0.0 10.0188581624946,53.508485005364,0.0 10.0189184117511,53.5084968229901,0.0 10.0191805195439,53.5085447261745,0.0 10.019294589487,53.5085617315325,0.0 10.0195898239927,53.5085938131166,0.0 10.019803977172,53.5086146703031,0.0 10.0200811336969,53.5086416609281,0.0 10.0201615099065,53.5086483365029,0.0 10.0212809669787,53.508741095409,0.0 10.0213115899611,53.5087448021648,0.0 10.0213777200194,53.5087572732645,0.0 10.0213728084121,53.5087665283848,0.0 10.0213075024511,53.5087542126971,0.0 10.021278223202,53.5087506685934,0.0 10.0201592678519,53.5086579512587,0.0 10.0200786971372,53.50865125953,0.0 10.0198013517338,53.5086242505117,0.0 10.0195870508166,53.5086033789364,0.0 10.0192911504331,53.5085712249945,0.0 10.019176154665,53.508554081616,0.0 10.0189134798749,53.5085060748061,0.0 10.0188530729075,53.5084942262455,0.0 10.0187512577502,53.5084742177089,0.0 10.0186506797609,53.508450167193,0.0 10.0185761437877,53.5084289131808,0.0 10.0184708923366,53.5083903001592,0.0 10.0184599493602,53.5083862657774,0.0 10.0182452554719,53.5083074699172,0.0 10.018187243564,53.5082807862644,0.0 10.0181160446522,53.5082647915001,0.0 10.0175739160788,53.5080147575759,0.0 10.0169584614591,53.5077403739491,0.0 10.0169479414991,53.507748759481,0.0</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark></Folder></kml>", filename: "beispielText.kml"},
                state = {
                    selectedFiletype: "auto",
                    supportedFiletypes: {
                        auto: {
                            caption: "common:modules.tools.fileImport.captions.supportedFiletypes.auto"
                        },
                        kml: {
                            caption: "common:modules.tools.fileImport.captions.supportedFiletypes.kml",
                            rgx: /\.kml$/i
                        }
                    }
                },
                recomendedFillColor = [
                    255,
                    0,
                    63,
                    0.6901960784313725
                ];

            importKML({state, dispatch, rootGetters}, payload);
            expect(dispatch.firstCall.args[0]).to.equal("Alerting/addSingleAlert");
            expect(dispatch.firstCall.args[1]).to.eql({
                category: "modules.alerting.categories.info",
                content: "modules.tools.fileImport.alertingMessages.success"
            });
            expect(dispatch.secondCall.args[0]).to.equal("addImportedFilename");
            expect(dispatch.secondCall.args[1]).to.equal("beispielText.kml");
            expect(layer.getSource().getFeatures().length).to.equal(1);
            expect(layer.getSource().getFeatures()[0].getStyle()(layer.getSource().getFeatures()[0])[0].getFill().getColor()).to.deep.equal(recomendedFillColor);
        });

        it("should set label style with color and font style", () => {
            const payload = {layer: layer, raw: "<kml xmlns=\"http://www.opengis.net/kml/2.2\" xmlns:gx=\"http://www.google.com/kml/ext/2.2\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd\"><Placemark><name>Jungfernstieg</name><Style><LabelStyle><color>ff1c1ae4</color><scale xmlns=\"\">2</scale></LabelStyle><IconStyle xmlns=\"\"><scale>0</scale><Icon><href>https://geoportal-hamburg.de/mastercode/2_7_0/img/tools/draw/circle_blue.svg</href></Icon></IconStyle></Style><ExtendedData><Data name=\"drawState\"/><Data name=\"fromDrawTool\"><value>true</value></Data><Data name=\"invisibleStyle\"/><Data name=\"isOuterCircle\"><value>false</value></Data><Data name=\"isVisible\"><value>true</value></Data><Data name=\"styleId\"><value>1</value></Data></ExtendedData><Point><coordinates>9.993521373625377,53.55359159312988</coordinates></Point></Placemark></kml>", filename: "TestFile1.kml"},
                state = {
                    selectedFiletype: "auto",
                    supportedFiletypes: {
                        auto: {
                            caption: "common:modules.tools.fileImport.captions.supportedFiletypes.auto"
                        },
                        kml: {
                            caption: "common:modules.tools.fileImport.captions.supportedFiletypes.kml",
                            rgx: /\.kml$/i
                        }
                    }
                };

            importKML({state, dispatch, rootGetters}, payload);

            expect(dispatch.firstCall.args[0]).to.equal("Alerting/addSingleAlert");
            expect(dispatch.firstCall.args[1]).to.eql({
                category: "modules.alerting.categories.info",
                content: "modules.tools.fileImport.alertingMessages.success"
            });
            expect(dispatch.secondCall.args[0]).to.equal("addImportedFilename");
            expect(dispatch.secondCall.args[1]).to.equal("TestFile1.kml");
            expect(layer.getSource().getFeatures().length).to.equal(1);
            expect(layer.getSource().getFeatures()[0].getStyle().getText().getFill()).to.deep.equals({
                color_: [228, 26, 28, 1]
            });
            expect(layer.getSource().getFeatures()[0].getStyle().getText().getFont()).to.equals("16px Arial");
            expect(layer.getSource().getFeatures()[0].getStyle().getText().getScale()).to.equals(2);
            expect(layer.getSource().getFeatures()[0].getStyle().getText().getText()).to.equals("Jungfernstieg");
            expect(layer.getSource().getFeatures()[0].getStyle().getText().getTextAlign()).to.equals("left");
            expect(layer.getSource().getFeatures()[0].getStyle().getText().getTextBaseline()).to.equals("bottom");
            expect(layer.getSource().getFeatures()[0].get("drawState")).to.deep.equals({
                fontSize: 32,
                text: "Jungfernstieg"
            });

        });

        it("adds a text style from the geojson file", () => {
            const payload = {layer: layer, raw: "{\"type\":\"FeatureCollection\",\"features\":[{\"type\":\"Feature\",\"geometry\":{\"type\":\"Point\",\"coordinates\":[9.999147727017332,53.56029963338006]},\"properties\":{\"isOuterCircle\":false,\"isVisible\":true,\"drawState\":{\"opacity\":1,\"font\":\"Arial\",\"fontSize\":16,\"text\":\"Mein Schatzzzz\",\"drawType\":{\"id\":\"writeText\",\"geometry\":\"Point\"},\"symbol\":{\"id\":\"iconPoint\",\"type\":\"simple_point\",\"value\":\"simple_point\"},\"zIndex\":0,\"imgPath\":\"https://geodienste.hamburg.de/lgv-config/img/\",\"pointSize\":16,\"color\":[77,175,74,1]},\"fromDrawTool\":true,\"invisibleStyle\":{\"geometry_\":null,\"fill_\":null,\"image_\":null,\"renderer_\":null,\"hitDetectionRenderer_\":null,\"stroke_\":null,\"text_\":{\"font_\":\"16px Arial\",\"scaleArray_\":[1,1],\"text_\":\"Mein Schatzzzz\",\"textAlign_\":\"left\",\"textBaseline_\":\"bottom\",\"fill_\":{\"color_\":[77,175,74,1]},\"maxAngle_\":0.7853981633974483,\"placement_\":\"point\",\"overflow_\":false,\"stroke_\":null,\"offsetX_\":0,\"offsetY_\":0,\"backgroundFill_\":null,\"backgroundStroke_\":null,\"padding_\":null},\"zIndex_\":9999},\"styleId\":\"1\"}}]}", filename: "beispielText.geojson"},
                state = {
                    selectedFiletype: "auto",
                    supportedFiletypes: {
                        auto: {
                            caption: "common:modules.tools.fileImport.captions.supportedFiletypes.auto"
                        },
                        geojson: {
                            caption: "common:modules.tools.fileImport.captions.supportedFiletypes.geojson",
                            rgx: /\.(geo)?json$/i
                        }
                    }
                };

            importGeoJSON({state, dispatch, rootGetters}, payload);
            expect(dispatch.firstCall.args[0]).to.equal("Alerting/addSingleAlert");
            expect(dispatch.firstCall.args[1]).to.eql({
                category: "modules.alerting.categories.info",
                content: "modules.tools.fileImport.alertingMessages.success"
            });
            expect(dispatch.secondCall.args[0]).to.equal("addImportedFilename");
            expect(dispatch.secondCall.args[1]).to.equal("beispielText.geojson");
            expect(layer.getSource().getFeatures().length).to.equal(1);
            expect(layer.getSource().getFeatures()[0].getStyle().getText().getText()).to.equal("Mein Schatzzzz");
        });

        it("Sets empty feature extent", done => {
            const payload = {features: [], fileName: "file1"},
                tmpState = {...importedState};

            testAction(setFeatureExtents, payload, tmpState, {}, [{
                type: "setFeatureExtents",
                payload: {file1: [Infinity, Infinity, -Infinity, -Infinity]}
            }], {}, done);
        });

        it("Sets feature extent", done => {
            const payload = {features: [{
                    getGeometry: () => sinon.spy({
                        getExtent: () => [10, 10, 10, 10]
                    })
                }], fileName: "file2"},
                tmpState = {...importedState, ...{featureExtents: {"file1": [100, 100, 100, 100]}}};

            testAction(setFeatureExtents, payload, tmpState, {}, [{
                type: "setFeatureExtents",
                payload: {"file1": [100, 100, 100, 100], "file2": [10, 10, 10, 10]}
            }], {}, done);
        });
    });
});
