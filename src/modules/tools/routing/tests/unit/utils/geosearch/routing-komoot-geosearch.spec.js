import axios from "axios";
import store from "../../../../../../../app-store";
import {expect} from "chai";
import sinon from "sinon";
import {RoutingGeosearchResult} from "../../../../utils/classes/routing-geosearch-result";
import {
    fetchRoutingKomootGeosearch,
    fetchRoutingKomootGeosearchReverse
} from "../../../../utils/geosearch/routing-komoot-geosearch";

describe("src/modules/tools/routing/utils/geosearch/routing-komoot-geosearch.js", () => {
    beforeEach(() => {
        const map = {
            id: "ol",
            mode: "2D",
            getView: () => {
                return {
                    getProjection: () => {
                        return {
                            getCode: () => "EPSG:25832"
                        };
                    }
                };
            }
        };

        mapCollection.clear();
        mapCollection.addMap(map, "2D");
        sinon.stub(i18next, "t").callsFake((...args) => args);
        store.getters.getRestServiceById = () => ({url: "tmp"});
        store.getters["Maps/boundingBox"] = [
            10.0233599, 53.5686992, 10.0235412, 53.5685187
        ];
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("should fetchRoutingKomootGeosearch", () => {
        it("should process result correct", async () => {
            sinon.stub(axios, "get").returns(
                new Promise((resolve) => resolve({
                    status: 200,
                    data: {
                        success: true,
                        features: [
                            {
                                geometry: {
                                    coordinates: [
                                        10.02344338987701, 53.5686328
                                    ],
                                    type: "Point"
                                },
                                type: "Feature",
                                properties: {
                                    osm_id: 38148402,
                                    extent: [
                                        10.0233599, 53.5686992, 10.0235412,
                                        53.5685187
                                    ],
                                    country: "Deutschland",
                                    city: "Hamburg",
                                    countrycode: "DE",
                                    postcode: "22085",
                                    type: "house",
                                    osm_type: "W",
                                    osm_key: "building",
                                    housenumber: "50",
                                    street: "Uhlenhorster Weg",
                                    district: "Uhlenhorst",
                                    osm_value: "apartments"
                                }
                            },
                            {
                                geometry: {
                                    coordinates: [10.0127361, 53.5715093],
                                    type: "Point"
                                },
                                type: "Feature",
                                properties: {
                                    osm_type: "R",
                                    osm_id: 284861,
                                    extent: [
                                        10.0038075, 53.582101, 10.0378378,
                                        53.5652488
                                    ],
                                    country: "Deutschland",
                                    osm_key: "place",
                                    city: "Hamburg",
                                    countrycode: "DE",
                                    osm_value: "suburb",
                                    postcode: "22085",
                                    name: "Uhlenhorst",
                                    type: "district"
                                }
                            }
                        ],
                        type: "FeatureCollection"
                    }
                })
                )
            );

            const result = await fetchRoutingKomootGeosearch("testsearch"),
                expectedResult = [
                    new RoutingGeosearchResult(
                        [10.02344338987701, 53.5686328],
                        "Uhlenhorster Weg 50"
                    ),
                    new RoutingGeosearchResult(
                        [10.0127361, 53.5715093],
                        "Uhlenhorst"
                    )
                ];

            expect(result).deep.to.equal(expectedResult);
        });

        it("should throw error with status", async () => {
            sinon.stub(axios, "get").returns(
                new Promise((_, reject) => reject({
                    status: 999,
                    message: "testerror"
                })
                )
            );

            try {
                await fetchRoutingKomootGeosearch("testsearch");
                // should not reach here
                expect(true).to.be.false;
            }
            catch (error) {
                expect(error.message).equal("testerror");
            }
        });
    });

    describe("should fetchRoutingKomootGeosearchReverse", () => {
        it("should process result correct", async () => {
            sinon.stub(axios, "get").returns(
                new Promise((resolve) => resolve({
                    status: 200,
                    data: {
                        success: true,
                        features: [
                            {
                                geometry: {
                                    coordinates: [
                                        10.02344338987701, 53.5686328
                                    ],
                                    type: "Point"
                                },
                                type: "Feature",
                                properties: {
                                    osm_id: 38148402,
                                    extent: [
                                        10.0233599, 53.5686992, 10.0235412,
                                        53.5685187
                                    ],
                                    country: "Deutschland",
                                    city: "Hamburg",
                                    countrycode: "DE",
                                    postcode: "22085",
                                    type: "house",
                                    osm_type: "W",
                                    osm_key: "building",
                                    housenumber: "50",
                                    street: "Uhlenhorster Weg",
                                    district: "Uhlenhorst",
                                    osm_value: "apartments"
                                }
                            }
                        ],
                        type: "FeatureCollection"
                    }
                })
                )
            );

            const result = await fetchRoutingKomootGeosearchReverse(
                    "testsearch"
                ),
                expectedResult = new RoutingGeosearchResult(
                    [10.02344338987701, 53.5686328],
                    "Uhlenhorster Weg 50"
                );

            expect(result).deep.to.eql(expectedResult);
        });

        it("should throw error with status", async () => {
            sinon.stub(axios, "get").returns(
                new Promise((_, reject) => reject({
                    status: 999,
                    message: "testerror"
                })
                )
            );

            try {
                await fetchRoutingKomootGeosearchReverse("testsearch");
                // should not reach here
                expect(true).to.be.false;
            }
            catch (error) {
                expect(error.message).equal("testerror");
            }
        });
    });
});
