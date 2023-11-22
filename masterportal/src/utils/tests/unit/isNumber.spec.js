import {expect} from "chai";
import isNumber from "../../isNumber";

describe("src/utils/isNumber", () => {
    it("should return false if the given param is not a number", () => {
        expect(isNumber()).to.be.false;
        expect(isNumber([])).to.be.false;
        expect(isNumber({})).to.be.false;
        expect(isNumber(null)).to.be.false;
        expect(isNumber("string")).to.be.false;
        expect(isNumber(true)).to.be.false;
        expect(isNumber(false)).to.be.false;
        expect(isNumber("a2ef")).to.be.false;
    });
    it("should return true if the given param is a number", () => {
        expect(isNumber(1234)).to.be.true;
    });
    it("should return true if the given param is a decimal number", () => {
        expect(isNumber(123.234)).to.be.true;
    });
    it("should return true if the given param is string but can convert to a number", () => {
        expect(isNumber("123534")).to.be.true;
    });
    it("should return true if the given param is string but can convert to a decimal number", () => {
        expect(isNumber("123.534")).to.be.true;
    });
});
