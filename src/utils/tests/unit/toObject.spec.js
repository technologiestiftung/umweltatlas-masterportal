import {expect} from "chai";
import toObject from "../../toObject.js";

describe("src/utils/toObject.js", () => {
    describe("toObject", function () {
        const arr1 = ["Akash", "Amit", "Aviral"],
            arr2 = [1, 2, 3],
            arr3 = [["Akash", "Amit"], ["pass", "pass"]],
            obj12 = {
                Akash: 1,
                Amit: 2,
                Aviral: 3
            },
            obj3 = {
                Akash: "Amit",
                pass: "pass"
            };

        it("should return an object", function () {
            expect(toObject(arr1, arr2)).to.deep.equal(obj12);
        });

        it("should return an object", function () {
            expect(toObject(arr3)).to.deep.equal(obj3);
        });
    });
});
