import {expect} from "chai";
import isEqual from "../../isEqual.js";

describe("src/utils/isEqual.js", () => {
    describe("isEqual", function () {
        const obj = {a: "foo", b: "bar", c: "baz"},
            obj2 = {a: "foo", c: "bar", b: "baz"},
            obj3 = {a: "foo", b: "bar"},
            obj4 = {name: "moe", luckyNumbers: [13, 27, 34]};

        it("should return false", function () {
            expect(isEqual(obj, obj2)).to.be.false;
        });
        it("should return false", function () {
            expect(isEqual(obj, obj3)).to.be.false;
        });
        it("should return true", function () {
            expect(isEqual(obj, {a: "foo", b: "bar", c: "baz"})).to.be.true;
        });
        it("should return true", function () {
            expect(isEqual(obj4, {name: "moe", luckyNumbers: [13, 27, 34]})).to.be.true;
        });
    });
});
