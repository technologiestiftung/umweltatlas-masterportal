import {expect} from "chai";
import uiStyle from "../../uiStyle";

describe("src/utils/uiStyle.js", () => {
    describe("uiStyle", function () {
        it("uiStyle should be an object", function () {
            expect(uiStyle).to.be.an("Object");
        });
        it("should return default value", function () {
            expect(uiStyle.getUiStyle()).to.be.a("String").and.equal("DEFAULT");
        });
        it("should return the setted value", function () {
            uiStyle.setUiStyle("TABLE");
            expect(uiStyle.getUiStyle()).to.be.a("String").and.equal("TABLE");
        });
    });
});
