import {expect} from "chai";
import getMasterPortalVersionNumber from "../../getMasterPortalVersionNumber";

describe("src/utils/getMasterPortalVersionNumber.js", () => {
    describe("getMasterPortalVersionNumber", () => {
        it("should return Masterportal version number", () => {
            expect(getMasterPortalVersionNumber()).to.be.a("string").and.not.to.be.empty;
        });
    });
});
