import Model from "@modules/core/util.js";
import {expect} from "chai";
import thousandsSeparator from "../../../../src/utils/thousandsSeparator";

describe("core/Util", function () {
    let model;
    const list = [
        {
            "name": "20097 Hamburg - Hamm",
            "id": "bkgSuggest3"
        },
        {
            "name": "20535 Hamburg - Hamm",
            "id": "bkgSuggest4"
        },
        {
            "name": "20537 Hamburg - Hamm",
            "id": "bkgSuggest5"
        },
        {
            "name": "22087 Hamburg - Hamm",
            "id": "bkgSuggest6"
        },
        {
            "name": "22089 Hamburg - Hamm",
            "id": "bkgSuggest7"
        },
        {
            "name": "22089 Hamburg - Hamm",
            "id": "bkgSuggest8"
        }
    ];

    describe("thousandsSeparator", function () {
        it("should set two points for 7 digit number with decimals", function () {
            expect(thousandsSeparator(1234567.890)).to.equal("1.234.567,89");
        });
        it("should set two points for 7 digit number with decimals", function () {
            expect(thousandsSeparator(-1234567.890)).to.equal("-1.234.567,89");
        });
        it("should set two  points for 7 digit number", function () {
            expect(thousandsSeparator(3456789)).to.equal("3.456.789");
        });
        it("should set two  points for 7 digit number", function () {
            expect(thousandsSeparator(-3456789)).to.equal("-3.456.789");
        });
        it("should set point for 4 digit number", function () {
            expect(thousandsSeparator(1000)).to.equal("1.000");
        });
        it("should set point for 4 digit number", function () {
            expect(thousandsSeparator(-1000)).to.equal("-1.000");
        });
        it("should not set point for 3 digit number", function () {
            expect(thousandsSeparator(785)).to.equal("785");
        });
        it("should not set point for 3 digit number", function () {
            expect(thousandsSeparator(-785)).to.equal("-785");
        });
        it("should not set point for 2 digit number", function () {
            expect(thousandsSeparator(85)).to.equal("85");
        });
        it("should not set point for 2 digit number", function () {
            expect(thousandsSeparator(-85)).to.equal("-85");
        });
        it("should not set point for 1 digit number", function () {
            expect(thousandsSeparator(1)).to.equal("1");
        });
        it("should not set point for 1 digit number", function () {
            expect(thousandsSeparator(-1)).to.equal("-1");
        });
        it("should work with 1 digit number with decimals", function () {
            expect(thousandsSeparator(5.22)).to.equal("5,22");
        });
        it("should work with 1 digit number with decimals", function () {
            expect(thousandsSeparator(-5.22)).to.equal("-5,22");
        });
    });
    describe("renameKeys", function () {
        const obj = {
            name: "Reder",
            job: "Frontend-Master",
            shoeSize: "100"
        };

        before(function () {
            model = new Model();
        });

        it("should return an object", function () {
            expect(model.renameKeys({name: "firstName", job: "passion"}, obj)).to.be.an("object");
        });

        it("should have the keys called firstName and passion", function () {
            expect(model.renameKeys({name: "firstName", job: "passion"}, obj)).to.include({firstName: "Reder", passion: "Frontend-Master"});
        });

        it("should have the key passion", function () {
            expect(model.renameKeys({names: "firstName", job: "passion"}, obj)).to.include({passion: "Frontend-Master"});
        });

        it("should have the keys called name, job and shoeSize", function () {
            expect(model.renameKeys({}, obj)).to.include({name: "Reder", job: "Frontend-Master", shoeSize: "100"});
        });
    });

    describe("renameValues", function () {
        const obj = {
            name: "Reder",
            job: "Frontend_Master",
            shoeSize: "100"
        };

        before(function () {
            model = new Model();
        });

        it("should return an object", function () {
            expect(model.renameValues({Reder: "Vornfeld", Frontend_Master: "Backend_Master"}, obj)).to.be.an("object");
        });

        it("should have the values Vornfeld and Backend_Master", function () {
            expect(model.renameValues({Reder: "Vornfeld", Frontend_Master: "Backend_Master"}, obj)).to.include({name: "Vornfeld", job: "Backend_Master"});
        });

        it("should have the values Reder and Backend_Master", function () {
            expect(model.renameValues({Duden: "Vornfeld", Frontend_Master: "Backend_Master"}, obj)).to.include({name: "Reder", job: "Backend_Master"});
        });

        it("should have the values Reder and Frontend_Master", function () {
            expect(model.renameValues({}, obj)).to.include({name: "Reder", job: "Frontend_Master"});
        });
    });

    describe("pickKeyValuePairs", function () {
        const obj = {
            name: "Reder",
            job: "Frontend_Master",
            shoeSize: "100"
        };

        before(function () {
            model = new Model();
        });

        it("should return an object", function () {
            expect(model.pickKeyValuePairs(obj, ["name", "job"])).to.be.an("object");
        });

        it("should have the keys name and job", function () {
            expect(model.pickKeyValuePairs(obj, ["name", "job"])).to.have.all.keys("name", "job");
        });

        it("should have the key job", function () {
            expect(model.pickKeyValuePairs(obj, [undefined, "job"])).to.have.all.keys("job");
        });

        it("should return an object equals {name: 'Reder', job: 'Frontend_Master'}", function () {
            expect(model.pickKeyValuePairs(obj, ["name", "job"])).to.deep.equal({name: "Reder", job: "Frontend_Master"});
        });
    });
    describe("pick", function () {
        it("should return the first entry with the name: 20097 Hamburg - Hamm and id: bkgSuggest3", function () {
            expect(model.pick(list, [0])).to.deep.equal({"0": list[0]});
        });
        it("should return the first entry with the name: 20097 Hamburg - Hamm and id: bkgSuggest3", function () {
            expect(model.pick(list, [100])).to.deep.equal({});
        });
        it("should return the first and second entry with the name: 20097 Hamburg - Hamm and id: bkgSuggest3", function () {
            expect(model.pick(list, [0, 1])).to.deep.equal({
                "0": {name: "20097 Hamburg - Hamm", id: "bkgSuggest3"},
                "1": {name: "20535 Hamburg - Hamm", id: "bkgSuggest4"}
            });
        });
        it("should return an empty object for an defined list but empty key", function () {
            expect(model.pick(list, [])).to.deep.equal({});
        });
        it("should return an empty object for an defined list but undefined key", function () {
            expect(model.pick(list, [undefined])).to.deep.equal({});
        });
        it("should return an empty object for an undefined list and undefined key", function () {
            expect(model.pick(undefined, [undefined])).to.deep.equal({});
        });
        it("should return an empty object for an undefined list but defined key", function () {
            expect(model.pick(undefined, [0])).to.deep.equal({});
        });
    });

    describe("omit", function () {
        const obj = {a: "foo", b: "bar", c: "baz"},
            objectBoolean = {true: {x: "foo", y: "bar"}},
            objectNumber = {1: "foo", 2: "bar", 3: "baz"};

        it("should return the 3. entry", function () {
            expect(model.omit(obj, ["a", "b"])).to.deep.equal({c: "baz"});
        });
        it("should return obj", function () {
            expect(model.omit(obj, [])).to.deep.equal(obj);
        });
        it("should return {}", function () {
            expect(model.omit(obj, ["a", "b", "c"])).to.deep.equal({});
        });
        it("should return obj", function () {
            expect(model.omit(obj, [undefined])).to.deep.equal(obj);
        });
        it("should return {}", function () {
            expect(model.omit(undefined, [undefined])).to.deep.equal({});
        });
        it("should return {}", function () {
            expect(model.omit(undefined, ["a"])).to.deep.equal({});
        });
        it("should return an empty array", function () {
            expect(model.omit(objectBoolean, [true])).to.be.an("object").that.is.empty;
        });
        it("should return the 3. entry by number array input", function () {
            expect(model.omit(objectNumber, [1, 2])).to.deep.equal({3: "baz"});
        });
    });

    describe("convertArrayElementsToString", function () {
        const arrayWithStrings = ["a", "b", "c"],
            arrayWithNumbers = [1, 2, 3],
            arrayWithBooleans = [true, false],
            arrayWithVariousElements = ["a", 1, true];

        it("should return an array with strings by array with strings as input", function () {
            expect(model.convertArrayElementsToString(arrayWithStrings)).to.deep.equal(arrayWithStrings);
        });
        it("should return an array with strings by array with numbers as input", function () {
            expect(model.convertArrayElementsToString(arrayWithNumbers)).to.deep.equal(["1", "2", "3"]);
        });
        it("should return an Aaray with strings by array with booleans as input", function () {
            expect(model.convertArrayElementsToString(arrayWithBooleans)).to.deep.equal(["true", "false"]);
        });
        it("should return an array with strings by array with various elements as input", function () {
            expect(model.convertArrayElementsToString(arrayWithVariousElements)).to.deep.equal(["a", "1", "true"]);
        });
        it("should return an empty array by empty array as input", function () {
            expect(model.convertArrayElementsToString([])).to.be.an("array").that.is.empty;
        });
        it("should return an empty array by undefined input", function () {
            expect(model.convertArrayElementsToString(undefined)).to.be.an("array").that.is.empty;
        });
    });

    describe("findWhereJs", function () {
        it("should return the first entry in the list", function () {
            expect(model.findWhereJs(list, {"id": "bkgSuggest3"})).to.deep.equal(list[0]);
        });
        it("should return the second entry in the list", function () {
            expect(model.findWhereJs(list, {"name": "20535 Hamburg - Hamm"})).to.deep.equal(list[1]);
        });
        it("should return undefined", function () {
            expect(model.findWhereJs(undefined, undefined)).to.be.undefined;
        });
        it("should return undefined", function () {
            expect(model.findWhereJs(list, "{}")).to.be.undefined;
        });
    });
    describe("whereJs", function () {
        it("should return the last two entry in the list", function () {
            expect(model.whereJs(list, {"name": "22089 Hamburg - Hamm"}).length).to.equal(2);
        });
        it("should return a empty list", function () {
            expect(model.whereJs(list, {"name": "22089 Hamburg - Hamm - xxx"}).length).to.equal(0);
        });
        it("should return the given list", function () {
            expect(model.whereJs(list, undefined).length).to.be.equal(6);
        });
        it("should return a empty list", function () {
            expect(model.whereJs(undefined, undefined).length).to.equal(0);
        });
    });
    describe("isEqual", function () {
        const obj = {a: "foo", b: "bar", c: "baz"},
            obj2 = {a: "foo", c: "bar", b: "baz"},
            obj3 = {a: "foo", b: "bar"},
            obj4 = {name: "moe", luckyNumbers: [13, 27, 34]};

        it("should return false", function () {
            expect(model.isEqual(obj, obj2)).to.be.false;
        });
        it("should return false", function () {
            expect(model.isEqual(obj, obj3)).to.be.false;
        });
        it("should return true", function () {
            expect(model.isEqual(obj, {a: "foo", b: "bar", c: "baz"})).to.be.true;
        });
        it("should return true", function () {
            expect(model.isEqual(obj4, {name: "moe", luckyNumbers: [13, 27, 34]})).to.be.true;
        });
    });
    describe("differenceJs", function () {
        it("should return the last three entries in the array", function () {
            const array = [1, 2, 3, 4, 5];

            expect(model.differenceJs(array, [1, 2])).to.deep.equal([3, 4, 5]);
        });
        it("should return the given five entries in the array", function () {
            const array = [1, 2, 3, 4, 5];

            expect(model.differenceJs(array, [])).to.deep.equal([1, 2, 3, 4, 5]);
        });
        it("should return the last two entries in the array", function () {
            const array = ["Hamburg", "Bremen", "Berlin", "Delmenhosrt"];

            expect(model.differenceJs(array, ["Hamburg", "Bremen"])).to.deep.equal(["Berlin", "Delmenhosrt"]);
        });
        it("should return the given five entries in the array", function () {
            const array = [1, 2, 3, 4, 5];

            expect(model.differenceJs(array, undefined)).to.deep.equal([1, 2, 3, 4, 5]);
        });
        it("should return an empty array", function () {
            expect(model.differenceJs(undefined, undefined)).to.deep.equal([]);
        });
    });
    describe("isEmpty", function () {
        it("should return true", function () {
            expect(model.isEmpty(null)).to.be.true;
        });
        it("should return true", function () {
            expect(model.isEmpty("")).to.be.true;
        });
        it("should return true", function () {
            expect(model.isEmpty({})).to.be.true;
        });
        it("should return true", function () {
            expect(model.isEmpty([])).to.be.true;
        });
        it("should return false", function () {
            expect(model.isEmpty({a: "1"})).to.be.false;
        });
    });
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
            expect(model.toObject(arr1, arr2)).to.deep.equal(obj12);
        });

        it("should return an object", function () {
            expect(model.toObject(arr3)).to.deep.equal(obj3);
        });
    });

    describe("sortBy", function () {
        it("should only sort arrays, objects and strings", function () {
            expect(model.sortBy(undefined)).to.be.an("array").to.be.empty;
            expect(model.sortBy(false)).to.be.an("array").to.be.empty;
            expect(model.sortBy(null)).to.be.an("array").to.be.empty;
            expect(model.sortBy("")).to.be.an("array").to.be.empty;
            expect(model.sortBy(0)).to.be.an("array").to.be.empty;
            expect(model.sortBy(123)).to.be.an("array").to.be.empty;
            expect(model.sortBy([])).to.be.an("array").to.be.empty;
            expect(model.sortBy({})).to.be.an("array").to.be.empty;
        });

        it("should handle undefined as infinit and null as zero", function () {
            const input = [undefined, null, -1, 1],
                expected = [-1, null, 1, undefined];

            expect(model.sortBy(input)).to.deep.equal(expected);
        });
        it("should sort a string alphabetically", function () {
            const input = "Hello World!",
                expected = [" ", "!", "H", "W", "d", "e", "l", "l", "l", "o", "o", "r"];

            expect(model.sortBy(input)).to.deep.equal(expected);
        });
        it("should sort an array of numbers numerically", function () {
            const input = [4, 8, 2, 99, 23, 11, 101],
                expected = [2, 4, 8, 11, 23, 99, 101];

            expect(model.sortBy(input)).to.deep.equal(expected);
        });
        it("should sort an array of numbers as strings alphabetically", function () {
            const input = ["4", "8", "2", "99", "23", "11", "101"],
                expected = ["101", "11", "2", "23", "4", "8", "99"];

            expect(model.sortBy(input)).to.deep.equal(expected);
        });
        it("should sort an array of numbers as strings and letters alphabetically by ascii code", function () {
            const input = ["1", "2", "b", "c", "A", "D", "3", "0"],
                expected = ["0", "1", "2", "3", "A", "D", "b", "c"];

            expect(model.sortBy(input)).to.deep.equal(expected);
        });
        it("should not sort an array of objects without iteratee", function () {
            const input = [{a: 1, b: 2, c: 3}, {d: 1, e: 2, f: 3}, {a: 5, b: 4, c: 3}, {a: 9, b: 8, c: 4}, {a: 0, b: 1, c: 2}],
                expected = input;

            expect(model.sortBy(input)).to.deep.equal(expected);
        });
        it("should sort an array of objects with a string as iteratee, putting objects without an iteratee key in the back", function () {
            const input = [{a: 1, b: 2, c: 3}, {d: 1, e: 2, f: 3}, {a: 5, b: 4, c: 3}, {a: 9, b: 8, c: 4}, {a: 0, b: 1, c: 2}],
                expected = [{a: 0, b: 1, c: 2}, {a: 1, b: 2, c: 3}, {a: 5, b: 4, c: 3}, {a: 9, b: 8, c: 4}, {d: 1, e: 2, f: 3}],
                iteratee = "a";

            expect(model.sortBy(input, iteratee)).to.deep.equal(expected);
        });
        it("should sort an array of objects with a number as iteratee, putting objects without an iteratee key in the back", function () {
            const input = [{"1": 4, a: 1, b: 2, c: 3}, {"1": 3, d: 1, e: 2, f: 3}, {"1": 1, a: 5, b: 4, c: 3}, {"1": 2, a: 9, b: 8, c: 4}, {a: 0, b: 1, c: 2}],
                expected = [{1: 1, a: 5, b: 4, c: 3}, {1: 2, a: 9, b: 8, c: 4}, {1: 3, d: 1, e: 2, f: 3}, {1: 4, a: 1, b: 2, c: 3}, {a: 0, b: 1, c: 2}],
                iteratee = 1;

            expect(model.sortBy(input, iteratee)).to.deep.equal(expected);
        });
        it("should sort an array of numbers with an iteratee function", function () {
            const input = [4, 8, 2, 99, 23, 11, 101],
                expected = [11, 99, 23, 4, 101, 2, 8];

            expect(model.sortBy(input, (sum) => {
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

            expect(model.sortBy(input, iteratee, context)).to.deep.equal(expected);
        });
    });
});
