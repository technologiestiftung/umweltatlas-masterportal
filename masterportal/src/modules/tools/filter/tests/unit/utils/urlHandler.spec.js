import {expect} from "chai";
import sinon from "sinon";
import UrlHandler from "../../../utils/urlHandler.js";
import MapHandler from "../../../utils/mapHandler.js";

describe("src/module/tools/filter/utils/mapHandler.js", () => {
    const urlHandler = new UrlHandler();

    describe("getParamsFromState", () => {
        it("should return an empty object if first param is not an object", () => {
            expect(urlHandler.getParamsFromState(undefined)).to.be.an("object").that.is.empty;
            expect(urlHandler.getParamsFromState(null)).to.be.an("object").that.is.empty;
            expect(urlHandler.getParamsFromState([])).to.be.an("object").that.is.empty;
            expect(urlHandler.getParamsFromState(true)).to.be.an("object").that.is.empty;
            expect(urlHandler.getParamsFromState(false)).to.be.an("object").that.is.empty;
            expect(urlHandler.getParamsFromState(1234)).to.be.an("object").that.is.empty;
            expect(urlHandler.getParamsFromState("string")).to.be.an("object").that.is.empty;
        });
        it("should return an empty object if second param is not an array", () => {
            expect(urlHandler.getParamsFromState({}, undefined)).to.be.an("object").that.is.empty;
            expect(urlHandler.getParamsFromState({}, null)).to.be.an("object").that.is.empty;
            expect(urlHandler.getParamsFromState({}, {})).to.be.an("object").that.is.empty;
            expect(urlHandler.getParamsFromState({}, true)).to.be.an("object").that.is.empty;
            expect(urlHandler.getParamsFromState({}, false)).to.be.an("object").that.is.empty;
            expect(urlHandler.getParamsFromState({}, "string")).to.be.an("object").that.is.empty;
            expect(urlHandler.getParamsFromState({}, 1234)).to.be.an("object").that.is.empty;
        });
        it("should return an object with matching attributes", () => {
            const stateObject = {
                    foo: "foo",
                    bar: "bar",
                    fow: "fow"
                },
                neededParams = ["foo", "fow"],
                expected = {
                    foo: "foo",
                    fow: "fow"
                };

            expect(urlHandler.getParamsFromState(stateObject, neededParams)).to.deep.equal(expected);
        });
        it("should return an empty object if no matches found", () => {
            const stateObject = {
                    foo: "foo",
                    bar: "bar",
                    fow: "fow"
                },
                neededParams = [];

            expect(urlHandler.getParamsFromState(stateObject, neededParams)).to.be.an("object").that.is.empty;
        });
    });
    describe("readFromUrlParams", () => {
        it("should parse the string into an object and return it", () => {
            const str = JSON.stringify({"rulesOfFilters": "foo", "bar": "bar"}),
                expected = {
                    rulesOfFilters: "foo",
                    bar: "bar"
                };

            urlHandler.readFromUrlParams(str, undefined, undefined, params => {
                expect(params).to.deep.equal(expected);
            });
        });
        it("should parse the string into an array and return it", () => {
            const str = JSON.stringify(["foo", "bar", {}]),
                transformOldUrlStub = sinon.stub(urlHandler, "transformOldUrl");

            urlHandler.readFromUrlParams(str);
            expect(transformOldUrlStub.called).to.be.true;
            sinon.restore();
        });
    });
    describe("transformOldUrl", () => {
        it("should return the basic template without any data if first param is not an array", () => {
            const expected = {
                rulesOfFilters: [],
                selectedAccordions: []
            };

            urlHandler.transformOldUrl(undefined, undefined, undefined, result => {
                expect(result).to.deep.equal(expected);
            });
            urlHandler.transformOldUrl(null, undefined, undefined, result => {
                expect(result).to.deep.equal(expected);
            });
            urlHandler.transformOldUrl({}, undefined, undefined, result => {
                expect(result).to.deep.equal(expected);
            });
            urlHandler.transformOldUrl(true, undefined, undefined, result => {
                expect(result).to.deep.equal(expected);
            });
            urlHandler.transformOldUrl(false, undefined, undefined, result => {
                expect(result).to.deep.equal(expected);
            });
            urlHandler.transformOldUrl("string", undefined, undefined, result => {
                expect(result).to.deep.equal(expected);
            });
        });
        it("should return the basic template without any data if first param is an empty array", () => {
            const expected = {
                rulesOfFilters: [],
                selectedAccordions: []
            };

            urlHandler.transformOldUrl([], undefined, undefined, result => {
                expect(result).to.deep.equal(expected);
            });
        });
        it("should return the basic template without any data if no matching filter is found", () => {
            const matchingFilterStub = sinon.stub(urlHandler, "getMatchingFilterFromGroupsOrLayers"),
                expected = {
                    rulesOfFilters: [],
                    selectedAccordions: []
                };

            matchingFilterStub.returns({index: -1});

            urlHandler.transformOldUrl([{"foooo": "fpp"}], {}, undefined, result => {
                expect(result).to.deep.equal(expected);
            });
            sinon.restore();
        });
        it("should return the template filled with data from the given param", () => {
            const matchingFilterStub = sinon.stub(urlHandler, "getMatchingFilterFromGroupsOrLayers"),
                getPreparedRuleStub = sinon.stub(urlHandler, "getPreparedRule"),
                expected = {
                    rulesOfFilters: [[{foo: "foo", snippetId: 0}]],
                    selectedAccordions: [{layerId: 0, filterId: 0}]
                },
                mapHandler = new MapHandler();

            /**
             * Testing function.
             * @param {Object} result From the onsuccess function.
             * @returns {void}
             */
            function onsuccess (result) {
                expect(result).to.deep.equal(expected);
            }

            sinon.stub(mapHandler, "initializeLayer");
            getPreparedRuleStub.returns({
                snippetId: 0,
                foo: "foo"
            });
            matchingFilterStub.returns({
                index: 0,
                filter: {
                    layerId: 0,
                    snippets: [
                        {foo: "foo"}
                    ],
                    api: {
                        setServiceByLayerModel: () => sinon.stub(),
                        getAttrTypes: sinon.stub().callsFake(() => {
                            onsuccess({
                                rulesOfFilters: [[{foo: "foo", snippetId: 0}]],
                                selectedAccordions: [{layerId: 0, filterId: 0}]
                            });
                        })
                    }
                }
            });


            urlHandler.transformOldUrl([{rules: [{foo: "foo"}]}], {}, mapHandler, onsuccess);
            sinon.restore();
        });
    });
    describe("setResultValues", () => {
        it("should not update last param if first param is not an object", () => {
            const result = {foo: "bar"},
                expected = {foo: "bar"};

            urlHandler.setResultValues(undefined, undefined, undefined, result);
            expect(result).to.deep.equal(expected);
            urlHandler.setResultValues(null, undefined, undefined, result);
            expect(result).to.deep.equal(expected);
            urlHandler.setResultValues([], undefined, undefined, result);
            expect(result).to.deep.equal(expected);
            urlHandler.setResultValues("string", undefined, undefined, result);
            expect(result).to.deep.equal(expected);
            urlHandler.setResultValues(1234, undefined, undefined, result);
            expect(result).to.deep.equal(expected);
            urlHandler.setResultValues(true, undefined, undefined, result);
            expect(result).to.deep.equal(expected);
            urlHandler.setResultValues(false, undefined, undefined, result);
            expect(result).to.deep.equal(expected);
        });
        it("should not update last param if second param is not an object", () => {
            const result = {foo: "bar"},
                expected = {foo: "bar"};

            urlHandler.setResultValues({}, undefined, undefined, result);
            expect(result).to.deep.equal(expected);
            urlHandler.setResultValues({}, null, undefined, result);
            expect(result).to.deep.equal(expected);
            urlHandler.setResultValues({}, [], undefined, result);
            expect(result).to.deep.equal(expected);
            urlHandler.setResultValues({}, "string", undefined, result);
            expect(result).to.deep.equal(expected);
            urlHandler.setResultValues({}, 1234, undefined, result);
            expect(result).to.deep.equal(expected);
            urlHandler.setResultValues({}, true, undefined, result);
            expect(result).to.deep.equal(expected);
            urlHandler.setResultValues({}, false, undefined, result);
            expect(result).to.deep.equal(expected);
        });
        it("should not update last param if third param is not an object", () => {
            const result = {foo: "bar"},
                expected = {foo: "bar"};

            urlHandler.setResultValues({}, {}, undefined, result);
            expect(result).to.deep.equal(expected);
            urlHandler.setResultValues({}, {}, null, result);
            expect(result).to.deep.equal(expected);
            urlHandler.setResultValues({}, {}, [], result);
            expect(result).to.deep.equal(expected);
            urlHandler.setResultValues({}, {}, "string", result);
            expect(result).to.deep.equal(expected);
            urlHandler.setResultValues({}, {}, 1234, result);
            expect(result).to.deep.equal(expected);
            urlHandler.setResultValues({}, {}, true, result);
            expect(result).to.deep.equal(expected);
            urlHandler.setResultValues({}, {}, false, result);
            expect(result).to.deep.equal(expected);
        });
        it("should not update last param if last param is not an object", () => {
            const result = {foo: "bar"},
                expected = {foo: "bar"};

            urlHandler.setResultValues({}, {}, {}, undefined);
            expect(result).to.deep.equal(expected);
            urlHandler.setResultValues({}, {}, {}, null);
            expect(result).to.deep.equal(expected);
            urlHandler.setResultValues({}, {}, {}, []);
            expect(result).to.deep.equal(expected);
            urlHandler.setResultValues({}, {}, {}, "string");
            expect(result).to.deep.equal(expected);
            urlHandler.setResultValues({}, {}, {}, 1234);
            expect(result).to.deep.equal(expected);
            urlHandler.setResultValues({}, {}, {}, true);
            expect(result).to.deep.equal(expected);
            urlHandler.setResultValues({}, {}, {}, false);
            expect(result).to.deep.equal(expected);
        });
        it("should update last param", () => {
            const result = {
                    rulesOfFilters: [],
                    selectedAccordions: []
                },
                expected = {
                    rulesOfFilters: [[{
                        attrName: "wow",
                        snippetId: 0,
                        fixed: false,
                        startup: false,
                        operator: "BETWEEN",
                        value: [
                            6,
                            2506
                        ]
                    }]],
                    selectedAccordions: [{
                        layerId: 0,
                        filterId: 0
                    }]
                },
                oldFilterObject = {
                    name: "woo",
                    isSelected: true,
                    layerId: 0,
                    rules: [
                        {
                            attrName: "wow",
                            snippetId: 0,
                            values: [
                                6,
                                2506
                            ]
                        }
                    ]
                },
                matchingFilter = {
                    index: 0,
                    filter: {
                        snippets: [
                            {
                                attrName: "wow"
                            }
                        ]
                    }
                },
                attrTypes = {
                    wow: "dropdown"
                };

            sinon.stub(urlHandler, "getPreparedRule").returns({
                fixed: false,
                startup: false,
                operator: "BETWEEN",
                value: [
                    6,
                    2506
                ]
            });
            urlHandler.setResultValues(oldFilterObject, matchingFilter, attrTypes, result);
            expect(result).to.deep.equal(expected);
            sinon.restore();
        });
    });
    describe("getMatchingFilterFromGroupsOrLayers", () => {
        it("should return template object without changed informations", () => {
            const expected = {
                filter: null,
                index: null
            };

            expect(urlHandler.getMatchingFilterFromGroupsOrLayers()).to.deep.equal(expected);
        });
        it("should return an object with informations if in groups found", () => {
            const expected = {
                filter: {
                    title: "foo"
                },
                index: 0
            };

            expect(urlHandler.getMatchingFilterFromGroupsOrLayers(
                {name: "foo"},
                [{layers: [{title: "foo"}]}]
            )).to.deep.equal(expected);
        });
        it("should return an object with informations if in layers found", () => {
            const expected = {
                filter: {
                    title: "foo"
                },
                index: 0
            };

            expect(urlHandler.getMatchingFilterFromGroupsOrLayers(
                {name: "foo"},
                undefined,
                [{title: "foo"}]
            )).to.deep.equal(expected);
        });
    });
    describe("getPreparedRule", () => {
        it("should return a prepared rule", () => {
            const expected = {
                attrName: "boo",
                snippetId: 0,
                fixed: false,
                startup: false,
                operator: "IN",
                value: "bow",
                values: "bow"
            };

            expect(urlHandler.getPreparedRule(
                {
                    attrName: "boo",
                    values: "bow"
                },
                {
                    attrName: "boo",
                    operator: "IN"
                },
                0
            )).to.deep.equal(expected);
        });
    });
});
