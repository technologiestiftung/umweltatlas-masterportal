import axios from "axios";
import store from "../../../../../../../app-store";
import {expect} from "chai";
import sinon from "sinon";
import {RoutingGeosearchResult} from "../../../../utils/classes/routing-geosearch-result";
import {fetchRoutingSpecialWfsGeosearch, makeWFSRequest} from "../../../../utils/geosearch/routing-specialWfs-geosearch";

describe("src/modules/tools/routing/utils/geosearch/routing-specialWfs-geosearch.js", () => {
    const makeWFSRequestStub = sinon.stub(),
        sampleResponseData = `<?xml version='1.0' encoding="UTF-8"?>
    <wfs:FeatureCollection
       xmlns:ms="http://mapserver.gis.umn.edu/mapserver"
       xmlns:gml="http://www.opengis.net/gml"
       xmlns:wfs="http://www.opengis.net/wfs"
       xmlns:ogc="http://www.opengis.net/ogc"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://mapserver.gis.umn.edu/mapserver https://mapservice.regensburg.de/cgi-bin/mapserv?map=/data/ows/maps/strassennamen25832.map&amp;SERVICE=WFS&amp;VERSION=1.1.0&amp;REQUEST=DescribeFeatureType&amp;TYPENAME=ms:strasse_nr&amp;OUTPUTFORMAT=text/xml;%20subtype=gml/3.1.1  http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd">
      <gml:boundedBy>
        <gml:Envelope srsName="EPSG:25832">
          <gml:lowerCorner>726717.541907 5434034.009161</gml:lowerCorner>
          <gml:upperCorner>726717.541907 5434034.009161</gml:upperCorner>
        </gml:Envelope>
      </gml:boundedBy>
      <gml:featureMember>
        <ms:strasse_nr gml:id="strasse_nr.660170">
          <gml:boundedBy>
            <gml:Envelope srsName="EPSG:25832">
              <gml:lowerCorner>726717.541907 5434034.009161</gml:lowerCorner>
              <gml:upperCorner>726717.541907 5434034.009161</gml:upperCorner>
            </gml:Envelope>
          </gml:boundedBy>
          <ms:msGeometry>
            <gml:Point srsName="EPSG:25832">
              <gml:pos>726717.541907 5434034.009161</gml:pos>
            </gml:Point>
          </ms:msGeometry>
          <ms:LABEL_TEXT>Dachauplatz 8</ms:LABEL_TEXT>
        </ms:strasse_nr>
      </gml:featureMember>
    </wfs:FeatureCollection>`;

    beforeEach(() => {
        sinon.stub(i18next, "t").callsFake((...args) => args);
        store.getters = {
            getRestServiceById: () => ({url: "tmp"})
        };
        store.state.Tools.Routing.geosearch.propertyNames = ["ms:LABEL_TEXT"];
        store.state.Tools.Routing.geosearch.typeName = "ms:strasse_nr";
        store.state.Tools.Routing.geosearch.geometryName = "ms:msGeometry";
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("should fetchRoutingSpecialWfsGeosearch", () => {
        it("should process result correct", async () => {
            makeWFSRequestStub.resolves({
                status: 200,
                data: sampleResponseData
            });
            sinon.stub(axios, "post").callsFake(makeWFSRequestStub);

            const result = await fetchRoutingSpecialWfsGeosearch("testsearch", {
                    getRestServiceById: () => ({url: "tmp"}),
                    state: {
                        Tools: {
                            Routing: {
                                geosearch: {
                                    propertyNames: ["ms:LABEL_TEXT"],
                                    typeName: "ms:strasse_nr",
                                    geometryName: "ms:msGeometry"
                                }
                            }
                        }
                    }
                }),

                expectedResult = [
                    new RoutingGeosearchResult([726717.541907, 5434034.009161], "Dachauplatz 8", "25832")
                ];

            expect(result).deep.to.equal(expectedResult);
        });


        it("should throw error with status", async () => {
            sinon.stub(axios, "post").returns(
                new Promise((_, reject) => reject({
                    status: 999,
                    message: "testerror"
                }))
            );

            try {
                await makeWFSRequest("testsearch");
                // should not reach here
                expect(true).to.be.false;
            }
            catch (error) {
                expect(error.message).to.equal("testerror"); // Compare the error message
            }
        });
    });
});
