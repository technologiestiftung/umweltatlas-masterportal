import axios from "axios";
import store from "../../../../../../../app-store";
import {expect} from "chai";
import sinon from "sinon";
import {RoutingGeosearchResult} from "../../../../utils/classes/routing-geosearch-result";
import {fetchRoutingLocationFinderGeosearch} from "../../../../utils/geosearch/routing-locationFinder-geosearch";

describe("src/modules/tools/routing/utils/geosearch/routing-locationFinder-geosearch.js", () => {
    beforeEach(() => {
        sinon.stub(i18next, "t").callsFake((...args) => args);
        store.getters = {
            getRestServiceById: () => ({url: "tmp"})
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("should fetchRoutingLocationFinderGeosearch", () => {
        it("should process result correct", async () => {
            sinon.stub(axios, "get").returns(
                new Promise((resolve) => resolve({
                    status: 200,
                    data: {
                        locs: [
                            {
                                id: 1609,
                                type: "Straßenname",
                                name: "Im Alten Park",
                                cx: 511114.73,
                                cy: 5397800.69,
                                xmin: 511097.28,
                                ymin: 5397769.7,
                                xmax: 511216.35,
                                ymax: 5397809.38
                            },
                            {
                                cx: 515643.21,
                                cy: 5404093.73,
                                epsg: 25832,
                                id: 2637,
                                name: "Parkstraße",
                                type: "Straßenname",
                                xmax: 515719.04,
                                xmin: 515435.23,
                                ymax: 5404246.82,
                                ymin: 5404023.02
                            }
                        ],
                        sref: 25832
                    }
                })
                )
            );

            const result = await fetchRoutingLocationFinderGeosearch(
                    "testsearch"
                ),
                expectedResult = [new RoutingGeosearchResult(
                    [511114.73, 5397800.69],
                    "Im Alten Park",
                    "25832"
                ),
                new RoutingGeosearchResult(
                    [515643.21, 5404093.73],
                    "Parkstraße",
                    "25832"
                )
                ];

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
                await fetchRoutingLocationFinderGeosearch("testsearch");
                // should not reach here
                expect(true).to.be.false;
            }
            catch (error) {
                expect(error.message).equal("testerror");
            }
        });
    });
});
