import {expect} from "chai";
import renameValues from "../../renameValues.js";

describe("src/utils/renameValues.js", function () {
    describe("renameValues", function () {
        const obj = {
            name: "Reder",
            job: "Frontend_Master",
            shoeSize: "100"
        };

        it("should return an object", function () {
            expect(renameValues({Reder: "Vornfeld", Frontend_Master: "Backend_Master"}, obj)).to.be.an("object");
        });

        it("should have the values Vornfeld and Backend_Master", function () {
            expect(renameValues({Reder: "Vornfeld", Frontend_Master: "Backend_Master"}, obj)).to.include({name: "Vornfeld", job: "Backend_Master"});
        });

        it("should have the values Reder and Backend_Master", function () {
            expect(renameValues({Duden: "Vornfeld", Frontend_Master: "Backend_Master"}, obj)).to.include({name: "Reder", job: "Backend_Master"});
        });

        it("should have the values Reder and Frontend_Master", function () {
            expect(renameValues({}, obj)).to.include({name: "Reder", job: "Frontend_Master"});
        });
    });
});
