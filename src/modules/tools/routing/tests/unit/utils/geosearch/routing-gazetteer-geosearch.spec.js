import {expect} from "chai";
import sinon from "sinon";
import {RoutingGeosearchResult} from "../../../../utils/classes/routing-geosearch-result";
import {fetchRoutingGazetteerGeosearch} from "../../../../utils/geosearch/routing-gazetteer-geosearch";

describe("src/modules/tools/routing/utils/geosearch/routing-gazeteer-geosearch.js", () => {
    let promise;

    beforeEach(() => {
        sinon.stub(i18next, "t").callsFake((...args) => args);
        promise = global.Promise;
        global.Promise = function () {
            return [
                {
                    geometry: {
                        type: "Point",
                        coordinates: [511114.73, 5397800.69]
                    },
                    name: "Gottschalkring 1"
                },
                {
                    geometry: {
                        type: "Point",
                        coordinates: [515643.21, 5404093.73]
                    },
                    name: "An der Marienanlage 11"
                }
            ];
        };
    });

    afterEach(() => {
        sinon.restore();
        global.Promise = promise;
    });

    describe("should fetchRoutingGazeteerGeosearch", () => {
        it("should process result correct", async () => {
            const result = await fetchRoutingGazetteerGeosearch(
                    "testsearch"
                ),
                expectedResult = [new RoutingGeosearchResult(
                    [511114.73, 5397800.69],
                    "Gottschalkring 1",
                    "25832"
                ),
                new RoutingGeosearchResult(
                    [515643.21, 5404093.73],
                    "An der Marienanlage 11",
                    "25832"
                )
                ];

            expect(result).deep.to.eql(expectedResult);
        });
    });
});
