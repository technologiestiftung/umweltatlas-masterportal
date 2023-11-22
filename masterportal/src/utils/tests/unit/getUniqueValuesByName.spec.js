import {expect} from "chai";
import getUniqueValuesByName from "../../getUniqueValuesByName";

describe("src/utils/getUniqueValuesByName", () => {
    it("should return an empty array if first param is not a string", () => {
        expect(getUniqueValuesByName(undefined)).to.deep.equal([]);
        expect(getUniqueValuesByName(null)).to.deep.equal([]);
        expect(getUniqueValuesByName({})).to.deep.equal([]);
        expect(getUniqueValuesByName([])).to.deep.equal([]);
        expect(getUniqueValuesByName(true)).to.deep.equal([]);
        expect(getUniqueValuesByName(false)).to.deep.equal([]);
        expect(getUniqueValuesByName(1234)).to.deep.equal([]);
    });

    it("should return an empty array if second param is not an array", () => {
        expect(getUniqueValuesByName("foo", {})).to.deep.equal([]);
        expect(getUniqueValuesByName("foo", "string")).to.deep.equal([]);
        expect(getUniqueValuesByName("foo", 1234)).to.deep.equal([]);
        expect(getUniqueValuesByName("foo", true)).to.deep.equal([]);
        expect(getUniqueValuesByName("foo", false)).to.deep.equal([]);
        expect(getUniqueValuesByName("foo", undefined)).to.deep.equal([]);
        expect(getUniqueValuesByName("foo", null)).to.deep.equal([]);
    });

    it("should return an empty array if second param is an empty array", () => {
        expect(getUniqueValuesByName("foo", [])).to.deep.equal([]);
    });

    it("should return an empty array if given name is not found in objects of the array", () => {
        const arr = [
                {
                    foo: "bar",
                    fuz: "buz"
                },
                {
                    foo: "bar",
                    fuz: "buz"
                }
            ],
            name = "fow";

        expect(getUniqueValuesByName(name, arr)).to.deep.equal([]);
    });

    it("should return an array with keys as strings", () => {
        const arr = [
                {
                    foo: "bar",
                    fuz: "buz"
                },
                {
                    foo: "bar",
                    fuz: "buz"
                }
            ],
            name = "foo";

        expect(getUniqueValuesByName(name, arr)).to.deep.equal(["bar"]);
    });
});
