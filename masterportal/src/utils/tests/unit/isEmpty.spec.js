import {expect} from "chai";
import isEmpty from "../../isEmpty";

describe("src/utils/isEmpty.js", function () {
    it("should return true", function () {
        expect(isEmpty(null)).to.be.true;
    });
    it("should return true", function () {
        expect(isEmpty("")).to.be.true;
    });
    it("should return true", function () {
        expect(isEmpty({})).to.be.true;
    });
    it("should return true", function () {
        expect(isEmpty([])).to.be.true;
    });
    it("should return false", function () {
        expect(isEmpty({a: "1"})).to.be.false;
    });
});
