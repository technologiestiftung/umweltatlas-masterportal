import {expect} from "chai";
import sinon from "sinon";
import prepareFeatureProperties from "../../../utils/prepareFeatureProperties";
import wfs from "@masterportal/masterportalapi/src/layer/wfs";

const exampleLayerInformation = {
        id: "wfst-layer",
        isSecured: false,
        featureNS: "http://www.deegree.org/app",
        featurePrefix: "app",
        featureType: "wfstgeom",
        gfiAttributes: "showAll",
        style: sinon.spy(),
        isSelected: true,
        name: "ZEBIS Point",
        url: "http://generic.url.com/my/wfst",
        version: "1.1.0"
    },
    exampleProperties = [
        {
            key: "name",
            label: "name",
            required: false,
            type: "string",
            value: null
        },
        {
            key: "nummer",
            label: "nummer",
            required: false,
            type: "integer",
            value: null
        },
        {
            key: "bemerkung",
            label: "bemerkung",
            required: false,
            type: "string",
            value: null
        },
        {
            key: "datum",
            label: "datum",
            required: false,
            type: "date",
            value: null
        },
        {
            key: "geom",
            label: "geom",
            required: false,
            type: "geometry",
            value: null
        }
    ];

describe("src/modules/tools/wfst/utils/prepareFeatureProperties.js", () => {
    let receivePossiblePropertiesStub;

    beforeEach(() => {
        receivePossiblePropertiesStub = sinon.stub(wfs, "receivePossibleProperties");
    });
    afterEach(sinon.restore);

    it("should return an empty array if the parameter gfiAttributes is set to ignore", async () => {
        exampleLayerInformation.gfiAttributes = "ignore";

        const properties = await prepareFeatureProperties.prepareFeatureProperties(exampleLayerInformation, false);

        expect(Array.isArray(properties)).to.be.true;
        expect(properties).to.deep.equal([]);
    });
    it("should hand through the array returned from receivePossibleProperties if the parameter gfiAttributes is set to showAll", async () => {
        exampleLayerInformation.gfiAttributes = "showAll";
        receivePossiblePropertiesStub.resolves(exampleProperties);

        const properties = await prepareFeatureProperties.prepareFeatureProperties(exampleLayerInformation, false);

        expect(Array.isArray(properties)).to.be.true;
        expect(properties).to.deep.equal(exampleProperties);
    });
    it("should filter the properties depending on gfiAttributes including its label if gfiAttributes is set to an object", async () => {
        exampleLayerInformation.gfiAttributes = {
            name: "Name",
            datum: "Datum"
        };
        receivePossiblePropertiesStub.resolves(exampleProperties);

        const properties = await prepareFeatureProperties.prepareFeatureProperties(exampleLayerInformation, false);

        expect(Array.isArray(properties)).to.be.true;
        expect(properties.length).to.equal(3);
        expect(properties.find(({key}) => key === "name").label).to.equal("Name");
        expect(properties.find(({key}) => key === "datum").label).to.equal("Datum");
        expect(properties.find(({type}) => type === "geometry")).to.exist;
    });
    it("should throw an Error if the masterportalapi call receivePossibleProperties fails", async () => {
        const expectedError = new Error("Error");

        receivePossiblePropertiesStub.rejects(expectedError);

        // eslint-disable-next-line one-var
        const consoleErrorStub = sinon.stub(console, "error"),
            properties = await prepareFeatureProperties.prepareFeatureProperties(exampleLayerInformation, false);

        expect(properties).to.be.an("array").that.is.empty;
        expect(consoleErrorStub).to.have.been.calledOnceWithExactly(expectedError);
    });
});
