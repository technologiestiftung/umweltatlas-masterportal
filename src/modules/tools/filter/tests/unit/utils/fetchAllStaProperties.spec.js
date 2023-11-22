import {expect} from "chai";
import {getUniqueValuesFromFetchedFeatures, getFilterableProperties} from "../../../utils/fetchAllStaProperties";

describe("src/modules/tools/filter/utils/fetchAllStaProperties.js", () => {
    describe("getUniqueValuesFromFetchedFeatures", () => {
        it("should return empty array if anything but object is given", () => {
            expect(getUniqueValuesFromFetchedFeatures([])).to.be.an("array").that.is.empty;
            expect(getUniqueValuesFromFetchedFeatures(null)).to.be.an("array").that.is.empty;
            expect(getUniqueValuesFromFetchedFeatures(true)).to.be.an("array").that.is.empty;
            expect(getUniqueValuesFromFetchedFeatures(false)).to.be.an("array").that.is.empty;
            expect(getUniqueValuesFromFetchedFeatures("string")).to.be.an("array").that.is.empty;
            expect(getUniqueValuesFromFetchedFeatures(1234)).to.be.an("array").that.is.empty;
            expect(getUniqueValuesFromFetchedFeatures(undefined)).to.be.an("array").that.is.empty;
        });
        it("should return an empty array if the string is not included in the given object", () => {
            const obj = {
                foo: "bar"
            };

            expect(getUniqueValuesFromFetchedFeatures(obj, "bar")).to.be.an("array").that.is.empty;
        });
        it("should return the value of the key from given object if the string is matching a key", () => {
            const obj = {
                foo: "bar"
            };

            expect(getUniqueValuesFromFetchedFeatures(obj, "foo")).to.be.equal("bar");
        });
    });
    describe("getFilterableProperties", () => {
        const dataOneThing = [{
                properties: {
                    foo: "bar",
                    bar: "foo",
                    number: 123
                }
            }],
            dataTwoThings = [{
                properties: {
                    foo: "bar",
                    bar: "foo",
                    number: 123
                }
            },
            {
                properties: {
                    foo: "bar2",
                    bar: "foo2",
                    number: 456
                }
            }],
            dataOneThingOneDatastream = [{
                properties: {
                    foo: "bar",
                    bar: "foo",
                    number: 123
                },
                Datastreams: [
                    {
                        properties: {
                            foo: "bar",
                            bar: "foo",
                            number: 123
                        }
                    }
                ]
            }],
            dataOneThingTwoDatastreams = [{
                properties: {
                    foo: "bar",
                    bar: "foo",
                    number: 123
                },
                Datastreams: [
                    {
                        properties: {
                            foo: "bar",
                            bar: "foo",
                            number: 123
                        }
                    },
                    {
                        properties: {
                            foo: "bar",
                            bar: "foo",
                            number: 123
                        }
                    }
                ]
            }],
            dataTwoThingTwoDatastreams = [{
                properties: {
                    foo: "bar",
                    bar: "foo",
                    number: 123
                },
                Datastreams: [
                    {
                        properties: {
                            foo: "bar",
                            bar: "foo",
                            number: 123
                        }
                    },
                    {
                        properties: {
                            foo: "bar",
                            bar: "foo",
                            number: 123
                        }
                    }
                ]
            },
            {
                properties: {
                    foo: "bar2",
                    bar: "foo2",
                    number: 456
                },
                Datastreams: [
                    {
                        properties: {
                            foo: "bar2",
                            bar: "foo2",
                            number: 456
                        }
                    },
                    {
                        properties: {
                            foo: "bar2",
                            bar: "foo2",
                            number: 456
                        }
                    }
                ]
            }],
            dataTwoThingTwoDatastreamsIdenticalValues = [{
                properties: {
                    foo: "bar",
                    bar: "foo",
                    number: 123
                },
                Datastreams: [
                    {
                        properties: {
                            foo: "bar",
                            bar: "foo",
                            number: 123
                        }
                    },
                    {
                        properties: {
                            foo: "bar",
                            bar: "foo",
                            number: 123
                        }
                    }
                ]
            },
            {
                properties: {
                    foo: "bar",
                    bar: "foo",
                    number: 123
                },
                Datastreams: [
                    {
                        properties: {
                            foo: "bar",
                            bar: "foo",
                            number: 123
                        }
                    },
                    {
                        properties: {
                            foo: "bar",
                            bar: "foo",
                            number: 123
                        }
                    }
                ]
            }],
            dataTwoThingTwoDatastreamsObservations = [{
                properties: {
                    foo: "bar",
                    bar: "foo",
                    number: 123
                },
                Datastreams: [
                    {
                        properties: {
                            foo: "bar",
                            bar: "foo",
                            number: 123
                        },
                        Observations: [
                            {
                                result: 1
                            }
                        ]
                    },
                    {
                        properties: {
                            foo: "bar",
                            bar: "foo",
                            number: 123
                        },
                        Observations: [
                            {
                                result: 1
                            }
                        ]
                    }
                ]
            },
            {
                properties: {
                    foo: "bar2",
                    bar: "foo2",
                    number: 456
                },
                Datastreams: [
                    {
                        properties: {
                            foo: "bar2",
                            bar: "foo2",
                            number: 456
                        }
                    },
                    {
                        properties: {
                            foo: "bar2",
                            bar: "foo2",
                            number: 456
                        }
                    }
                ]
            }],
            dataOneDatastreamWithPropsAndObservation = [{
                properties: {
                    foo: "bar",
                    bar: "foo",
                    number: 123
                },
                Observations: [
                    {
                        result: 1
                    }
                ]
            }];

        it("should return empty object if data is an empty array", () => {
            expect(getFilterableProperties([])).to.be.an("object").that.is.empty;
        });
        it("should return thing properties", () => {
            expect(getFilterableProperties(dataOneThing)).to.deep.equal({
                foo: {bar: true},
                bar: {foo: true},
                number: {123: true}
            });
        });
        it("should return thing properties and multiple values", () => {
            expect(getFilterableProperties(dataTwoThings)).to.deep.equal({
                foo: {
                    bar: true,
                    bar2: true
                },
                bar: {
                    foo: true,
                    foo2: true
                },
                number: {
                    123: true,
                    456: true
                }
            });
        });
        it("should return thing properties and datastream properties", () => {
            expect(getFilterableProperties(dataOneThingOneDatastream)).to.deep.equal({
                foo: {
                    bar: true
                },
                bar: {
                    foo: true
                },
                number: {
                    123: true
                },
                "@Datastreams.0.properties.foo": {
                    bar: true
                },
                "@Datastreams.0.properties.bar": {
                    foo: true
                },
                "@Datastreams.0.properties.number": {
                    123: true
                }
            });
        });
        it("should return thing properties and datastream properties for 2 datastreams", () => {
            expect(getFilterableProperties(dataOneThingTwoDatastreams)).to.deep.equal({
                foo: {
                    bar: true
                },
                bar: {
                    foo: true
                },
                number: {
                    123: true
                },
                "@Datastreams.0.properties.foo": {
                    bar: true
                },
                "@Datastreams.0.properties.bar": {
                    foo: true
                },
                "@Datastreams.0.properties.number": {
                    123: true
                },
                "@Datastreams.1.properties.foo": {
                    bar: true
                },
                "@Datastreams.1.properties.bar": {
                    foo: true
                },
                "@Datastreams.1.properties.number": {
                    123: true
                }
            });
        });
        it("should return thing properties and datastream properties for 2 datastreams and multiple values", () => {
            expect(getFilterableProperties(dataTwoThingTwoDatastreams)).to.deep.equal({
                foo: {
                    bar: true,
                    bar2: true
                },
                bar: {
                    foo: true,
                    foo2: true
                },
                number: {
                    123: true,
                    456: true
                },
                "@Datastreams.0.properties.foo": {
                    bar: true,
                    bar2: true
                },
                "@Datastreams.0.properties.bar": {
                    foo: true,
                    foo2: true
                },
                "@Datastreams.0.properties.number": {
                    123: true,
                    456: true
                },
                "@Datastreams.1.properties.foo": {
                    bar: true,
                    bar2: true
                },
                "@Datastreams.1.properties.bar": {
                    foo: true,
                    foo2: true
                },
                "@Datastreams.1.properties.number": {
                    123: true,
                    456: true
                }
            });
        });
        it("should return thing properties and datastream properties for 2 datastreams and identical values", () => {
            expect(getFilterableProperties(dataTwoThingTwoDatastreamsIdenticalValues)).to.deep.equal({
                foo: {
                    bar: true
                },
                bar: {
                    foo: true
                },
                number: {
                    123: true
                },
                "@Datastreams.0.properties.foo": {
                    bar: true
                },
                "@Datastreams.0.properties.bar": {
                    foo: true
                },
                "@Datastreams.0.properties.number": {
                    123: true
                },
                "@Datastreams.1.properties.foo": {
                    bar: true
                },
                "@Datastreams.1.properties.bar": {
                    foo: true
                },
                "@Datastreams.1.properties.number": {
                    123: true
                }
            });
        });
        it("should return thing properties and datastream properties for 2 datastreams and Datastreams", () => {
            expect(getFilterableProperties(dataTwoThingTwoDatastreamsObservations)).to.deep.equal({
                foo: {
                    bar: true,
                    bar2: true
                },
                bar: {
                    foo: true,
                    foo2: true
                },
                number: {
                    123: true,
                    456: true
                },
                "@Datastreams.0.Observations.0.result": {
                    1: true
                },
                "@Datastreams.0.properties.foo": {
                    bar: true,
                    bar2: true
                },
                "@Datastreams.0.properties.bar": {
                    foo: true,
                    foo2: true
                },
                "@Datastreams.0.properties.number": {
                    123: true,
                    456: true
                },
                "@Datastreams.1.Observations.0.result": {
                    1: true
                },
                "@Datastreams.1.properties.foo": {
                    bar: true,
                    bar2: true
                },
                "@Datastreams.1.properties.bar": {
                    foo: true,
                    foo2: true
                },
                "@Datastreams.1.properties.number": {
                    123: true,
                    456: true
                }
            });
        });
        it("should return  properties and 1st observation if entity has observations", () => {
            expect(getFilterableProperties(dataOneDatastreamWithPropsAndObservation)).to.deep.equal({
                foo: {
                    bar: true
                },
                bar: {
                    foo: true
                },
                number: {
                    123: true
                },
                "@Datastreams.0.Observations.0.result": {
                    1: true
                }
            });
        });

    });
});
