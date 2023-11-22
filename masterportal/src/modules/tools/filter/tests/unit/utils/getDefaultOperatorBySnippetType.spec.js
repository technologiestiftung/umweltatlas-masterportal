import {expect} from "chai";
import {getDefaultOperatorBySnippetType} from "../../../utils/getDefaultOperatorBySnippetType.js";

describe("src/modules/tools/filter/utils/getDefaultOperatorBySnippetType.js", () => {
    describe("getDefaultOperatorBySnippetType", () => {
        it("should return operator according to the input snippet type", () => {
            expect(getDefaultOperatorBySnippetType(undefined)).to.equal("EQ");
            expect(getDefaultOperatorBySnippetType(null)).to.equal("EQ");
            expect(getDefaultOperatorBySnippetType(0)).to.equal("EQ");
            expect(getDefaultOperatorBySnippetType({})).to.equal("EQ");
            expect(getDefaultOperatorBySnippetType([])).to.equal("EQ");
            expect(getDefaultOperatorBySnippetType("checkbox")).to.equal("EQ");
            expect(getDefaultOperatorBySnippetType("date")).to.equal("EQ");
            expect(getDefaultOperatorBySnippetType("dateRange")).to.equal("INTERSECTS");
            expect(getDefaultOperatorBySnippetType("dropdown")).to.equal("EQ");
            expect(getDefaultOperatorBySnippetType("text")).to.equal("IN");
            expect(getDefaultOperatorBySnippetType("slider")).to.equal("EQ");
            expect(getDefaultOperatorBySnippetType("sliderRange")).to.equal("BETWEEN");
        });
        it("should return expected operator if the second parameter is set to true", () => {
            expect(getDefaultOperatorBySnippetType(undefined, true)).to.equal("EQ");
            expect(getDefaultOperatorBySnippetType(null, true)).to.equal("EQ");
            expect(getDefaultOperatorBySnippetType(0, true)).to.equal("EQ");
            expect(getDefaultOperatorBySnippetType({}, true)).to.equal("EQ");
            expect(getDefaultOperatorBySnippetType([], true)).to.equal("EQ");
            expect(getDefaultOperatorBySnippetType("checkbox", true)).to.equal("EQ");
            expect(getDefaultOperatorBySnippetType("date", true)).to.equal("EQ");
            expect(getDefaultOperatorBySnippetType("dateRange", true)).to.equal("INTERSECTS");
            expect(getDefaultOperatorBySnippetType("dropdown", true)).to.equal("IN");
            expect(getDefaultOperatorBySnippetType("text", true)).to.equal("IN");
            expect(getDefaultOperatorBySnippetType("slider", true)).to.equal("EQ");
            expect(getDefaultOperatorBySnippetType("sliderRange", true)).to.equal("BETWEEN");
        });
    });
});
