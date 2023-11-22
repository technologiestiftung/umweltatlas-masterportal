import {expect} from "chai";
import {sort, sortObjectsAsAddress, splitAddressString, isValidAddressString, convertInputs} from "../../sort.js";

describe("src/utils/sort.js", () => {

    describe("sort", function () {
        // undefined
        it("should return undefined for undefined input", function () {
            expect(sort("", undefined)).to.be.undefined;
        });
        // array
        it("should sort array[String] alphanumerically", function () {
            const array = ["Test 11", "Test 1", "Test 2", "Test 5"];

            expect(sort("", array)).to.deep.equal(["Test 1", "Test 2", "Test 5", "Test 11"]);
        });
        it("should sort array[String] alphanumerically with insensitive case", function () {
            const array = ["Test 11", "test 1", "test 2", "Test 5"];

            expect(sort("", array)).to.deep.equal(["test 1", "test 2", "Test 5", "Test 11"]);
        });
        it("should sort array[int] alphanumerically", function () {
            const array = [11, 1, 2, 5];

            expect(sort("", array)).to.deep.equal([1, 2, 5, 11]);
        });
        it("should sort array[float] alphanumerically", function () {
            const array = [11.1, 1.1, 2.1, 5.1];

            expect(sort("", array)).to.deep.equal([1.1, 2.1, 5.1, 11.1]);
        });
        // object
        it("should sort array[object] with integers alphanumerically first attr1, then attr2", function () {
            const array = [];

            array.push({attr1: 1, attr2: 11});
            array.push({attr1: 11, attr2: 5});
            array.push({attr1: 5, attr2: 5});
            array.push({attr1: 5, attr2: 1});
            expect(sort("", array, "attr1", "attr2")).to.deep.equal([
                {attr1: 1, attr2: 11}, {attr1: 5, attr2: 1}, {attr1: 5, attr2: 5}, {attr1: 11, attr2: 5}
            ]);
        });
        it("should sort array[object] with integers alphanumerically first attr2, then attr1", function () {
            const array = [];

            array.push({attr1: 1, attr2: 11});
            array.push({attr1: 11, attr2: 5});
            array.push({attr1: 5, attr2: 5});
            array.push({attr1: 5, attr2: 1});
            expect(sort("", array, "attr2", "attr1")).to.deep.equal([
                {attr1: 5, attr2: 1}, {attr1: 5, attr2: 5}, {attr1: 11, attr2: 5}, {attr1: 1, attr2: 11}
            ]);
        });
        it("should sort array[object] with integers alphanumerically only attr1", function () {
            const array = [];

            array.push({attr1: 1, attr2: 11});
            array.push({attr1: 11, attr2: 5});
            array.push({attr1: 5, attr2: 5});
            array.push({attr1: 5, attr2: 1});
            expect(sort("", array, "attr1")).to.deep.equal([
                {attr1: 1, attr2: 11}, {attr1: 5, attr2: 5}, {attr1: 5, attr2: 1}, {attr1: 11, attr2: 5}
            ]);
        });
        it("should sort array[object] with integers alphanumerically only attr2", function () {
            const array = [];

            array.push({attr1: 1, attr2: 11});
            array.push({attr1: 11, attr2: 5});
            array.push({attr1: 5, attr2: 5});
            array.push({attr1: 5, attr2: 1});
            expect(sort("", array, "attr2")).to.deep.equal([
                {attr1: 5, attr2: 1}, {attr1: 11, attr2: 5}, {attr1: 5, attr2: 5}, {attr1: 1, attr2: 11}
            ]);
        });
        it("should sort array[object] with integers alphanumerically attr1 === undefined attr2", function () {
            const array = [];

            array.push({attr1: 1, attr2: 11});
            array.push({attr1: 11, attr2: 5});
            array.push({attr1: 5, attr2: 5});
            array.push({attr1: 5, attr2: 1});
            expect(sort("", array, undefined, "attr2")).to.deep.equal([
                {attr1: 5, attr2: 1}, {attr1: 11, attr2: 5}, {attr1: 5, attr2: 5}, {attr1: 1, attr2: 11}
            ]);
        });
        it("should sort array[object] with Strings alphanumerically first attr1, then attr2", function () {
            const array = [];

            array.push({attr1: "1", attr2: ""});
            array.push({attr1: "11", attr2: "a"});
            array.push({attr1: "5", attr2: "b"});
            array.push({attr1: "5", attr2: "c"});

            expect(sort("", array, "attr1", "attr2")).to.deep.equal([
                {attr1: "1", attr2: ""}, {attr1: "5", attr2: "b"}, {attr1: "5", attr2: "c"}, {attr1: "11", attr2: "a"}
            ]);
        });
        it("should sort array[object] with Strings alphanumerically first attr2, then attr1", function () {
            const array = [];

            array.push({attr1: "1", attr2: ""});
            array.push({attr1: "11", attr2: "a"});
            array.push({attr1: "5", attr2: "b"});
            array.push({attr1: "5", attr2: "c"});

            expect(sort("", array, "attr2", "attr1")).to.deep.equal([
                {attr1: "1", attr2: ""}, {attr1: "11", attr2: "a"}, {attr1: "5", attr2: "b"}, {attr1: "5", attr2: "c"}
            ]);
        });
        it("should sort array[object] with Strings alphanumerically first attr2, then attr1 in insensitive case", function () {
            const array = [];

            array.push({attr1: "1", attr2: ""});
            array.push({attr1: "11", attr2: "A"});
            array.push({attr1: "5", attr2: "b"});
            array.push({attr1: "5", attr2: "C"});

            expect(sort("", array, "attr2", "attr1")).to.deep.equal([
                {attr1: "1", attr2: ""}, {attr1: "11", attr2: "A"}, {attr1: "5", attr2: "b"}, {attr1: "5", attr2: "C"}
            ]);
        });
    });

    describe("sortObjectsAsAddress", function () {
        it("should return sorted objects", function () {
            const array = [];

            array.push({name: "aStraße 1b, 12345 Stadt"});
            array.push({name: "aStraße 1, 12345 Stadt"});
            array.push({name: "cStraße ohne Namen 10, 12345 Stadt"});
            array.push({name: "aStraße 10, 12345 Stadt"});
            array.push({name: "aStraße 2, 12345 Stadt"});
            array.push({name: "aStraße 1a, 12345 Stadt"});
            array.push({name: "bStraße 10, 12345 Stadt"});
            array.push({name: "12Straße 10, 12345 Stadt"});
            expect(sortObjectsAsAddress(array)).to.deep.equal([
                {name: "12Straße 10, 12345 Stadt"},
                {name: "aStraße 1, 12345 Stadt"},
                {name: "aStraße 1a, 12345 Stadt"},
                {name: "aStraße 1b, 12345 Stadt"},
                {name: "aStraße 2, 12345 Stadt"},
                {name: "aStraße 10, 12345 Stadt"},
                {name: "bStraße 10, 12345 Stadt"},
                {name: "cStraße ohne Namen 10, 12345 Stadt"}
            ]);
        });
    });


    describe("splitAddressString", function () {
        it("should split addressString with streetname without blank", function () {
            expect(splitAddressString("Straße 1, PLZ Stadt", ",", " ")).to.deep.equal([
                "Straße",
                "1",
                "PLZ",
                "Stadt"
            ]);
        });
        it("should split addressString with streetname without blank and housenumber with suffix", function () {
            expect(splitAddressString("Straße 1a, PLZ Stadt", ",", " ")).to.deep.equal([
                "Straße",
                "1a",
                "PLZ",
                "Stadt"
            ]);
        });
        it("should split addressString with streetname with blank", function () {
            expect(splitAddressString("Platz ohne Namen 1, PLZ Stadt", ",", " ")).to.deep.equal([
                "Platz ohne Namen",
                "1",
                "PLZ",
                "Stadt"
            ]);
        });
    });

    describe("isValidAddressString", function () {
        it("should return true for valid address strings", function () {
            expect(isValidAddressString("aStraße 1b, 12345 Stadt", ",", " ")).to.be.true;
            expect(isValidAddressString("aStraße 1, 12345 Stadt", ",", " ")).to.be.true;
            expect(isValidAddressString("cStraße ohne Namen 10, 12345 Stadt", ",", " ")).to.be.true;
        });
        it("should return false for invalid address stringsA", function () {
            expect(isValidAddressString("aStraße 1b 12345 Stadt", ",", " ")).to.be.false;
        });
        it("should return false for invalid address stringsB", function () {
            expect(isValidAddressString("aStraße, 12345 Stadt", ",", " ")).to.be.false;
        });
    });

    describe("convertInputs", function () {
        it("should return the default parameter", function () {
            expect(convertInputs(null)).to.be.null;
            expect(convertInputs(false)).to.be.false;
            expect(convertInputs([])).to.be.deep.equal([]);
            expect(convertInputs({})).to.be.deep.equal({});
        });

        it("should return a number", function () {
            expect(convertInputs("12")).to.be.equal(12);
        });

        it("should return a string with uppercase", function () {
            expect(convertInputs("test")).to.be.equal("TEST");
        });
    });
});
