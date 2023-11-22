import Model from "@modules/searchbar/gaz/model.js";
import {expect} from "chai";
import sinon from "sinon";
import uniqueId from "../../../../../src/utils/uniqueId";

describe("modules/searchbar/gaz", () => {
    let model;

    const config = {
        "searchBar": {
            "gazetteer": {
                "minchars": 3,
                "serviceId": "8",
                "searchAddress": true,
                "searchStreets": true,
                "searchHouseNumbers": true,
                "searchDistricts": true,
                "searchParcels": true,
                "searchStreetKey": true
            },
            "zoomLevel": 9,
            "placeholder": "Suche nach Adresse/Krankenhaus/B-Plan"
        }
    };

    before(() => {
        i18next.init({
            lng: "cimode",
            debug: false
        });
    });

    beforeEach(() => {
        model = new Model(config.searchBar.gazetteer);
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("processSearchResults", () => {
        const searchResults = [
            {
                name: "Result Name1",
                type: "street",
                geometry: {
                    coordinates: [10, 20]
                },
                properties: {
                    hausnummer: {
                        _: "10"
                    },
                    hausnummernzusatz: {
                        _: "a"
                    }
                }
            }];

        it("push one result with eventType = paste", () => {
            const pushResultMock = sinon.spy(model, "pushResult"),
                setPastedHouseNumberMock = sinon.spy(model, "setPastedHouseNumber");

            sinon.stub(Radio, "request").callsFake(sinon.spy(() => searchResults));

            model.setPastedHouseNumber("10a");
            model.processSearchResults(searchResults);

            expect(pushResultMock.calledOnce).to.be.true;
            expect(pushResultMock.args[0][0]).to.includes(searchResults[0]);
            expect(setPastedHouseNumberMock.calledTwice).to.be.true;
            expect(setPastedHouseNumberMock.args[0][0]).to.equals("10a");
            expect(setPastedHouseNumberMock.args[1][0]).to.equals(null);
        });

        it("push all results", () => {
            const pushAllResultsMock = sinon.spy(model, "pushAllResults");

            sinon.stub(Radio, "request").callsFake(sinon.spy(() => searchResults));

            model.setPastedHouseNumber("18");
            model.processSearchResults(searchResults);

            expect(pushAllResultsMock.calledOnce).to.be.true;
            expect(pushAllResultsMock.args[0][0]).to.includes(searchResults[0]);
        });
    });

    describe("pushAllResults", () => {
        it("push two results to Searchbar hitList", () => {
            const searchResults = [
                    {
                        name: "Result Name1",
                        type: "street",
                        geometry: {
                            coordinates: [10, 20]
                        }
                    },
                    {
                        name: "Result Name2",
                        type: "district",
                        geometry: {
                            coordinates: [30, 40]
                        }
                    }],
                request = sinon.spy(() => searchResults),
                pushResultMock = sinon.spy(model, "pushResult");

            sinon.stub(Radio, "request").callsFake(request);

            model.pushAllResults(searchResults);
            expect(pushResultMock.args[0][0]).to.includes(searchResults[0]);
            expect(pushResultMock.args[1][0]).to.includes(searchResults[1]);
        });
    });

    describe("pushResult", () => {
        const trigger = sinon.spy();

        beforeEach(() => {
            sinon.stub(Radio, "trigger").callsFake(trigger);
        });

        it("push one result to Searchbar hitList", () => {
            const searchResult = {
                name: "Result Name",
                type: "street",
                geometry: {
                    coordinates: [10, 20]
                },
                properties: {
                    name: "abc"
                }
            };

            model.pushResult(searchResult);

            expect(trigger.calledOnce).to.be.true;
            expect(trigger.firstCall.args).to.deep.equal(["Searchbar", "pushHits", "hitList", {
                name: searchResult.name,
                type: "modules.searchbar.type.street",
                coordinate: searchResult.geometry.coordinates,
                icon: "bi-signpost-split-fill",
                id: "gazSuggest" + (parseInt(uniqueId(), 10) - 1),
                properties: {
                    name: "abc"
                },
                storedQuery: "street"
            }, null]);
        });
    });

    describe("removeDuplicateAddresses", () => {
        it("removes one of duplicate search results identified by gml:id", () => {
            const searchResults = [{
                    name: "Result1",
                    type: "street",
                    properties: {
                        $: {"gml:id": "42"}
                    }
                },
                {
                    name: "Result2",
                    type: "street",
                    properties: {
                        $: {"gml:id": "0815"}
                    }
                },
                {
                    name: "Result2",
                    type: "street",
                    properties: {
                        $: {"gml:id": "0815"}
                    }
                }],
                uniqueResults = model.removeDuplicateAddresses(searchResults);

            expect(uniqueResults).to.have.lengthOf(2);
        });
    });

    describe("getTranslationByType", () => {
        it("returns the translation for type = addressAffixed", () => {
            expect(model.getTranslationByType("addressAffixed")).to.equal("modules.searchbar.type.address");
        });
        it("returns the translation for type = addressUnaffixed", () => {
            expect(model.getTranslationByType("addressUnaffixed")).to.equal("modules.searchbar.type.address");
        });
        it("returns the translation for type = district", () => {
            expect(model.getTranslationByType("district")).to.equal("modules.searchbar.type.district");
        });
        it("returns the translation for type = houseNumbersForStreet", () => {
            expect(model.getTranslationByType("houseNumbersForStreet")).to.equal("modules.searchbar.type.address");
        });
        it("returns the translation for type = parcel", () => {
            expect(model.getTranslationByType("parcel")).to.equal("modules.searchbar.type.parcel");
        });
        it("returns the translation for type = street", () => {
            expect(model.getTranslationByType("street")).to.equal("modules.searchbar.type.street");
        });
    });

    describe("setPastedHouseNumber", () => {
        it("set the pasted housenumber to model", () => {
            model.setPastedHouseNumber("18");
            expect(model.get("pastedHouseNumber")).to.equal("18");
        });
    });
});
