import {expect} from "chai";
import splitListWithDelimiter from "../../../utils/splitListWithDelimiter.js";

describe("src/modules/tools/filter/utils/splitListWithDelimiter.js", () => {
    describe("splitListWithDelimiter", () => {
        it("should return an empty array if anything but an array is given as first parameter", () => {
            expect(splitListWithDelimiter(undefined)).to.be.undefined;
            expect(splitListWithDelimiter(null)).to.be.null;
            expect(splitListWithDelimiter("string")).to.equal("string");
            expect(splitListWithDelimiter(1234)).to.equal(1234);
            expect(splitListWithDelimiter(true)).to.be.true;
            expect(splitListWithDelimiter(false)).to.be.false;
            expect(splitListWithDelimiter({})).to.be.an("object").and.to.be.empty;
        });
        it("should return the first parameter as it is if the second parameter is anything but a string", () => {
            expect(splitListWithDelimiter([1, 1, 1], undefined)).to.deep.equal([1, 1, 1]);
            expect(splitListWithDelimiter([1, 1, 1], null)).to.deep.equal([1, 1, 1]);
            expect(splitListWithDelimiter([1, 1, 1], 1234)).to.deep.equal([1, 1, 1]);
            expect(splitListWithDelimiter([1, 1, 1], true)).to.deep.equal([1, 1, 1]);
            expect(splitListWithDelimiter([1, 1, 1], false)).to.deep.equal([1, 1, 1]);
            expect(splitListWithDelimiter([1, 1, 1], {})).to.deep.equal([1, 1, 1]);
            expect(splitListWithDelimiter([1, 1, 1], [])).to.deep.equal([1, 1, 1]);
        });
        it("should return a list of unique value if a list of strings containing the given delimiter is given", () => {
            const list = [
                    "foo|bar|foobar|baz",
                    "baz|qux|bar|quux",
                    "foo|foobar",
                    "quux",
                    "something unique",
                    "other,;delimiters"
                ],
                expected = [
                    "foo",
                    "bar",
                    "foobar",
                    "baz",
                    "qux",
                    "quux",
                    "something unique",
                    "other,;delimiters"
                ];

            expect(splitListWithDelimiter(list, "|")).to.deep.equal(expected);
        });
    });
});
