import {expect} from "chai";
import renameKeys from "../../renameKeys.js";

describe("src/utils/renameKeys.js", function () {
    describe("renameKeys", function () {
        const obj = {
            name: "Reder",
            job: "Frontend-Master",
            shoeSize: "100"
        };

        it("should return an object", function () {
            expect(renameKeys({name: "firstName", job: "passion"}, obj)).to.be.an("object");
        });

        it("should have the keys called firstName and passion", function () {
            expect(renameKeys({name: "firstName", job: "passion"}, obj)).to.include({firstName: "Reder", passion: "Frontend-Master"});
        });

        it("should have the key passion", function () {
            expect(renameKeys({names: "firstName", job: "passion"}, obj)).to.include({passion: "Frontend-Master"});
        });

        it("should have the keys called name, job and shoeSize", function () {
            expect(renameKeys({}, obj)).to.include({name: "Reder", job: "Frontend-Master", shoeSize: "100"});
        });
    });
});
