import {expect} from "chai";
import sortBy from "../../sortBy";

describe("src/utils/sortBy.js", function () {
    it("should only sort arrays, objects and strings", function () {
        expect(sortBy(undefined)).to.be.an("array").to.be.empty;
        expect(sortBy(false)).to.be.an("array").to.be.empty;
        expect(sortBy(null)).to.be.an("array").to.be.empty;
        expect(sortBy("")).to.be.an("array").to.be.empty;
        expect(sortBy(0)).to.be.an("array").to.be.empty;
        expect(sortBy(123)).to.be.an("array").to.be.empty;
        expect(sortBy([])).to.be.an("array").to.be.empty;
        expect(sortBy({})).to.be.an("array").to.be.empty;
    });

    it("should handle undefined as infinit and null as zero", function () {
        const input = [undefined, null, -1, 1],
            expected = [-1, null, 1, undefined];

        expect(sortBy(input)).to.deep.equal(expected);
    });
    it("should sort a string alphabetically", function () {
        const input = "Hello World!",
            expected = [" ", "!", "H", "W", "d", "e", "l", "l", "l", "o", "o", "r"];

        expect(sortBy(input)).to.deep.equal(expected);
    });
    it("should sort an array of numbers numerically", function () {
        const input = [4, 8, 2, 99, 23, 11, 101],
            expected = [2, 4, 8, 11, 23, 99, 101];

        expect(sortBy(input)).to.deep.equal(expected);
    });
    it("should sort an array of numbers as strings alphabetically", function () {
        const input = ["4", "8", "2", "99", "23", "11", "101"],
            expected = ["101", "11", "2", "23", "4", "8", "99"];

        expect(sortBy(input)).to.deep.equal(expected);
    });
    it("should sort an array of numbers as strings and letters alphabetically by ascii code", function () {
        const input = ["1", "2", "b", "c", "A", "D", "3", "0"],
            expected = ["0", "1", "2", "3", "A", "D", "b", "c"];

        expect(sortBy(input)).to.deep.equal(expected);
    });
    it("should not sort an array of objects without iteratee", function () {
        const input = [{a: 1, b: 2, c: 3}, {d: 1, e: 2, f: 3}, {a: 5, b: 4, c: 3}, {a: 9, b: 8, c: 4}, {a: 0, b: 1, c: 2}],
            expected = input;

        expect(sortBy(input)).to.deep.equal(expected);
    });
    it("should sort an array of objects with a string as iteratee, putting objects without an iteratee key in the back", function () {
        const input = [{a: 1, b: 2, c: 3}, {d: 1, e: 2, f: 3}, {a: 5, b: 4, c: 3}, {a: 9, b: 8, c: 4}, {a: 0, b: 1, c: 2}],
            expected = [{a: 0, b: 1, c: 2}, {a: 1, b: 2, c: 3}, {a: 5, b: 4, c: 3}, {a: 9, b: 8, c: 4}, {d: 1, e: 2, f: 3}],
            iteratee = "a";

        expect(sortBy(input, iteratee)).to.deep.equal(expected);
    });
    it("should sort an array of objects with a number as iteratee, putting objects without an iteratee key in the back", function () {
        const input = [{"1": 4, a: 1, b: 2, c: 3}, {"1": 3, d: 1, e: 2, f: 3}, {"1": 1, a: 5, b: 4, c: 3}, {"1": 2, a: 9, b: 8, c: 4}, {a: 0, b: 1, c: 2}],
            expected = [{1: 1, a: 5, b: 4, c: 3}, {1: 2, a: 9, b: 8, c: 4}, {1: 3, d: 1, e: 2, f: 3}, {1: 4, a: 1, b: 2, c: 3}, {a: 0, b: 1, c: 2}],
            iteratee = 1;

        expect(sortBy(input, iteratee)).to.deep.equal(expected);
    });
    it("should sort an array of numbers with an iteratee function", function () {
        const input = [4, 8, 2, 99, 23, 11, 101],
            expected = [11, 99, 23, 4, 101, 2, 8];

        expect(sortBy(input, (sum) => {
            return Math.sin(sum);
        })).to.deep.equal(expected);
    });
    it("should use the given context as scope for the iteratee", function () {
        const input = [4, 8, 2, 99, 23, 11, 101],
            expected = [11, 99, 23, 4, 101, 2, 8],
            context = new function () {
                this.sin = (num) => {
                    return Math.sin(num);
                };
            }();

        /**
         * iteratee of sortBy
         * @param {*} value the value
         * @returns {*}  the value to sort by
         */
        function iteratee (value) {
            return this.sin(value);
        }

        expect(sortBy(input, iteratee, context)).to.deep.equal(expected);
    });
});
