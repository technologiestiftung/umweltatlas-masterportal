import {expect} from "chai";
import {isCluster} from "../../isCluster";
import sinon from "sinon";
import Feature from "ol/Feature";

describe("utils/isCluster", () => {

    beforeEach(function () {
        sinon.spy(console, "error");
    });

    afterEach(function () {
        console.error.restore();
        sinon.restore();
    });

    it("should return false if the given param is an object", () => {
        expect(isCluster({})).to.be.false;
    });

    it("should return false if the given param is null", () => {
        expect(isCluster(null)).to.be.false;
    });

    it("should return false if the given param is undefined", () => {
        expect(isCluster(undefined)).to.be.false;
    });

    it("should return false if the given param is a number", () => {
        expect(isCluster(666)).to.be.false;
    });

    it("should return false if the given param is a string", () => {
        expect(isCluster("string")).to.be.false;
    });

    it("should return false if the given param is a boolean", () => {
        expect(isCluster(true)).to.be.false;
    });

    it("should return false if the given param is an array", () => {
        expect(isCluster([])).to.be.false;
    });

    it("should call an error if the given param is not a feature", () => {
        isCluster(true);
        expect(console.error.calledOnce).to.be.true;
    });

    it("should return false if no clustered features exists", () => {
        const feature = new Feature();

        expect(isCluster(feature)).to.be.false;
    });

    it("should return false if clustered Feature is a number", () => {
        const feature = new Feature();

        feature.set("features", 123);

        expect(isCluster(feature)).to.be.false;
    });

    it("should return false if clustered Feature is null", () => {
        const feature = new Feature();

        feature.set("features", null);

        expect(isCluster(feature)).to.be.false;
    });

    it("should return false if clustered Feature is a string", () => {
        const feature = new Feature();

        feature.set("features", "string");

        expect(isCluster(feature)).to.be.false;
    });

    it("should return false if clustered Feature is undefined", () => {
        const feature = new Feature();

        feature.set("features", undefined);

        expect(isCluster(feature)).to.be.false;
    });

    it("should return false if clustered Feature is a boolean", () => {
        const feature = new Feature();

        feature.set("features", false);

        expect(isCluster(feature)).to.be.false;
    });

    it("should return true if clustered Features exists", () => {
        const feature = new Feature(),
            clusterFeatures = [new Feature(), new Feature()];

        feature.set("features", clusterFeatures);

        expect(isCluster(feature)).to.be.true;
    });
});
