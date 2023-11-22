import {config, createLocalVue, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import Vuex from "vuex";
import TableComponent from "../../components/TableComponent.vue";
import sinon from "sinon";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/share-components/table/components/TableComponent.vue", () => {
    describe("DOM", () => {
        it("should render the title if present", () => {
            const wrapper = shallowMount(TableComponent, {
                propsData: {
                    data: {
                        headers: ["foo"],
                        items: [["bar"]]
                    },
                    title: "Titel"
                },
                localVue
            });

            expect(wrapper.find("h5").text()).to.be.equal("Titel");
        });

        it("should render the table with one row", () => {
            const wrapper = shallowMount(TableComponent, {
                propsData: {
                    data: {
                        headers: ["foo"],
                        items: [["bar"]]
                    }
                },
                localVue
            });

            expect(wrapper.findAll("th").length).to.be.equal(1);
        });
        it("should render the table with multiple columns and rows", () => {
            const wrapper = shallowMount(TableComponent, {
                propsData: {
                    data: {
                        headers: ["foo", "bar", "buz"],
                        items: [
                            ["foo", "bar", "buz"],
                            ["foo", "bar", "buz"],
                            ["foo", "bar", "buz"],
                            ["foo", "bar", "buz"]
                        ]
                    }
                },
                localVue
            });

            expect(wrapper.findAll("tr").length).to.be.equal(5);
            expect(wrapper.findAll("th").length).to.be.equal(3);
        });

        it("should render table with sorting arrows", () => {
            const wrapper = shallowMount(TableComponent, {
                propsData: {
                    data: {
                        headers: ["foo"]
                    },
                    sortable: true
                },
                localVue
            });

            expect(wrapper.findAll(".bootstrap-icon").length).to.be.equal(1);
        });
        it("should select a column if column is clicked", async () => {
            const wrapper = shallowMount(TableComponent, {
                    propsData: {
                        data: {
                            headers: ["foo", "bar", "buz"],
                            items: [
                                ["foo", "bar", "buz"],
                                ["foo", "bar", "buz"],
                                ["foo", "bar", "buz"],
                                ["foo", "bar", "buz"]
                            ]
                        },
                        selectMode: "column"
                    },
                    localVue
                }),
                td = wrapper.findAll("td").at(1),
                th = wrapper.findAll("th").at(1);

            td.trigger("click");
            await wrapper.vm.$nextTick();
            expect(th.classes().includes("selected")).to.be.true;
            expect(td.classes().includes("selected")).to.be.true;
        });
        it("should select a row if row is clicked", async () => {
            const wrapper = shallowMount(TableComponent, {
                    propsData: {
                        data: {
                            headers: ["foo", "bar", "buz"],
                            items: [
                                ["foo", "bar", "buz"],
                                ["foo", "bar", "buz"],
                                ["foo", "bar", "buz"],
                                ["foo", "bar", "buz"]
                            ]
                        },
                        selectMode: "row"
                    },
                    localVue
                }),
                tds = wrapper.findAll("td"),
                td1 = tds.at(1),
                tr = wrapper.findAll("tr").at(1);

            td1.trigger("click");
            await wrapper.vm.$nextTick();
            expect(tr.classes().includes("selected")).to.be.true;
        });
        it("should render the table without fixed data", () => {
            const wrapper = shallowMount(TableComponent, {
                propsData: {
                    data: {
                        headers: ["foo", "bar", "buz"],
                        items: [
                            ["foo", "bar", "buz"]
                        ]
                    }
                },
                localVue
            });

            expect(wrapper.findAll(".fixed").length).to.be.equal(0);
        });
        it("should render the table without fixed data with the wrong format fixed data ", () => {
            const wrapper = shallowMount(TableComponent, {
                propsData: {
                    data: {
                        headers: ["foo", "bar", "buz"],
                        items: [
                            ["foo", "bar", "buz"]
                        ]
                    },
                    fixedData: {
                        items: null
                    }
                },
                localVue
            });

            expect(wrapper.findAll(".fixed").length).to.be.equal(0);
        });
        it("should render the table with fixed data", () => {
            const wrapper = shallowMount(TableComponent, {
                propsData: {
                    data: {
                        headers: ["foo", "bar", "buz"],
                        items: [
                            ["foo", "bar", "buz"]
                        ]
                    },
                    fixedData: {
                        items: [
                            ["foo", "bar", "buz"],
                            ["foo", "bar", "buz"]
                        ]
                    }
                },
                localVue
            });

            expect(wrapper.findAll(".fixed").length).to.be.equal(2);
        });
    });
    describe("methods", () => {
        describe("handleTDSelect", () => {
            it("should call selectColumn if selectMode is column", () => {
                const wrapper = shallowMount(TableComponent, {
                        propsData: {
                            data: {},
                            selectMode: "column"
                        },
                        localVue
                    }),
                    selectColumnStub = sinon.stub(wrapper.vm, "selectColumn");

                wrapper.vm.handleTDSelect("foo", "bar", 0);
                expect(selectColumnStub.called).to.be.true;
                sinon.restore();
            });
            it("should call selectRow if selectMode is row", () => {
                const wrapper = shallowMount(TableComponent, {
                        propsData: {
                            data: {},
                            selectMode: "row"
                        },
                        localVue
                    }),
                    selectRowStub = sinon.stub(wrapper.vm, "selectRow");

                wrapper.vm.handleTDSelect("foo", "bar", []);
                expect(selectRowStub.called).to.be.true;
                sinon.restore();
            });
        });
        describe("selectRow", () => {
            it("should not emit selected row if selectMode is not equals row", () => {
                const wrapper = shallowMount(TableComponent, {
                        propsData: {
                            data: {},
                            selectMode: "column"
                        },
                        localVue
                    }),
                    stringifiedRowStub = sinon.stub(wrapper.vm, "getStringifiedRow").returns("fooBar");

                wrapper.vm.selectRow();
                expect(stringifiedRowStub.called).to.be.false;
                expect(wrapper.emitted()).to.not.have.property("rowSelected");
                expect(wrapper.vm.selectedRow).to.not.be.equal("fooBar");
                sinon.restore();
            });
            it("should emit selected row if selectMode is equals row", () => {
                const wrapper = shallowMount(TableComponent, {
                        propsData: {
                            data: {},
                            selectMode: "row"
                        },
                        localVue
                    }),
                    stringifiedRowStub = sinon.stub(wrapper.vm, "getStringifiedRow").returns("fooBar");

                wrapper.vm.selectRow();
                expect(stringifiedRowStub.called).to.be.true;
                expect(wrapper.emitted()).to.have.property("rowSelected");
                expect(wrapper.vm.selectedRow).to.be.equal("fooBar");
                sinon.restore();
            });
        });
        describe("selectColumn", () => {
            it("should not emit selected column if selectMode is not equals column", () => {
                const wrapper = shallowMount(TableComponent, {
                        propsData: {
                            data: {},
                            selectMode: "column"
                        },
                        localVue
                    }),
                    expected = "foo";

                wrapper.vm.selectColumn(expected, 0);
                expect(wrapper.emitted()).to.not.have.property("columnSelected");
                expect(wrapper.vm.selectedRow).to.not.be.equal(expected);
            });
            it("should not emit selected column if selectMode is equals column but no column name is given", () => {
                const wrapper = shallowMount(TableComponent, {
                        propsData: {
                            data: {},
                            selectMode: "column"
                        },
                        localVue
                    }),
                    expected = "foo";

                wrapper.vm.selectColumn(undefined, 0);
                expect(wrapper.emitted()).to.not.have.property("columnSelected");
                expect(wrapper.vm.selectedColumn).to.not.be.equal(expected);
            });
            it("should not emit selected column if selectMode is equals column and column name is given but column idx is 0", () => {
                const wrapper = shallowMount(TableComponent, {
                        propsData: {
                            data: {},
                            selectMode: "column"
                        },
                        localVue
                    }),
                    expected = "foo";

                wrapper.vm.selectColumn(undefined, 0);
                expect(wrapper.emitted()).to.not.have.property("columnSelected");
                expect(wrapper.vm.selectedColumn).to.not.be.equal(expected);
            });
            it("should emit selected column if selectMode is equals column and column name is given and column idx is not 0", () => {
                const wrapper = shallowMount(TableComponent, {
                        propsData: {
                            data: {},
                            selectMode: "column"
                        },
                        localVue
                    }),
                    expected = "foo";

                wrapper.vm.selectColumn(expected, 1);
                expect(wrapper.emitted()).to.have.property("columnSelected");
                expect(wrapper.vm.selectedColumn).to.be.equal(expected);
            });
        });
        describe("getIconClassByOrder", () => {
            it("should return 'bi-arrow-down-up origin-order' if sorting column name not equals current sorting name", () => {
                const wrapper = shallowMount(TableComponent, {
                        propsData: {
                            data: {}
                        },
                        localVue
                    }),
                    expected = "bi-arrow-down-up origin-order";

                wrapper.vm.currentSorting = {};
                expect(wrapper.vm.getIconClassByOrder("foo")).to.be.equals(expected);
            });
            it("should return 'bi-arrow-up' if current sorting order is asc", () => {
                const wrapper = shallowMount(TableComponent, {
                        propsData: {
                            data: {}
                        },
                        localVue
                    }),
                    expected = "bi-arrow-up";

                wrapper.vm.currentSorting = {
                    columnName: "foo",
                    order: "asc"
                };
                expect(wrapper.vm.getIconClassByOrder("foo")).to.be.equals(expected);
            });
            it("should return 'bi-arrow-down' if current sorting order is desc", () => {
                const wrapper = shallowMount(TableComponent, {
                        propsData: {
                            data: {}
                        },
                        localVue
                    }),
                    expected = "bi-arrow-down";

                wrapper.vm.currentSorting = {
                    columnName: "foo",
                    order: "desc"
                };
                expect(wrapper.vm.getIconClassByOrder("foo")).to.be.equals(expected);
            });
            it("should return 'bi-arrow-down-up origin-order' if current sorting order is not desc nor asc", () => {
                const wrapper = shallowMount(TableComponent, {
                        propsData: {
                            data: {}
                        },
                        localVue
                    }),
                    expected = "bi-arrow-down-up origin-order";

                wrapper.vm.currentSorting = {
                    columnName: "foo",
                    order: "baz"
                };
                expect(wrapper.vm.getIconClassByOrder("foo")).to.be.equals(expected);
            });
        });
        describe("getSortOrder", () => {
            it("should return 'desc' order when passed 'origin'", () => {
                const wrapper = shallowMount(TableComponent, {
                        propsData: {
                            data: {}
                        },
                        localVue
                    }),
                    order = wrapper.vm.getSortOrder("origin");

                expect(order).to.be.equal("desc");
            });

            it("should return 'asc' order when passed 'desc'", () => {
                const wrapper = shallowMount(TableComponent, {
                        propsData: {
                            data: {}
                        },
                        localVue
                    }),
                    order = wrapper.vm.getSortOrder("desc");

                expect(order).to.be.equal("asc");
            });

            it("should return 'origin' order when passed 'asc'", () => {
                const wrapper = shallowMount(TableComponent, {
                        propsData: {
                            data: {}
                        },
                        localVue
                    }),
                    order = wrapper.vm.getSortOrder("asc");

                expect(order).to.be.equal("origin");
            });
        });
        describe("getSortedRows", () => {
            it("should return the 'originRows' if the rows are to be sorted in their origin order", () => {
                const wrapper = shallowMount(TableComponent, {
                        propsData: {
                            data: {
                                headers: ["foo", "bar", "buz"],
                                items: [
                                    ["foo", "bar", "buz"],
                                    ["fow", "bar", "buz"],
                                    ["fox", "bar", "buz"],
                                    ["foy", "bar", "buz"]
                                ]
                            }
                        },
                        localVue
                    }),
                    originRows = wrapper.vm.getSortedRows([], "foo", "origin");

                expect(originRows).to.deep.equal(wrapper.vm.data.items);
            });
            it("should return the rows in ascending order", () => {
                const wrapper = shallowMount(TableComponent, {
                        propsData: {
                            data: {
                                headers: ["foo", "bar", "buz"],
                                items: [
                                    [2, "bar", "buz"],
                                    [3, "bar", "buz"],
                                    [1, "bar", "buz"],
                                    [4, "bar", "buz"]
                                ]
                            }
                        },
                        localVue
                    }),
                    expectRows = [
                        [1, "bar", "buz"],
                        [2, "bar", "buz"],
                        [3, "bar", "buz"],
                        [4, "bar", "buz"]
                    ],
                    sortedRows = wrapper.vm.getSortedRows(wrapper.vm.data.items, "foo", "asc");

                expect(sortedRows).to.deep.equal(expectRows);
            });
            it("should return the rows in descending order", () => {
                const wrapper = shallowMount(TableComponent, {
                        propsData: {
                            data: {
                                headers: ["foo", "bar", "buz"],
                                items: [
                                    [2, "bar", "buz"],
                                    [3, "bar", "buz"],
                                    [1, "bar", "buz"],
                                    [4, "bar", "buz"]
                                ]
                            }
                        },
                        localVue
                    }),
                    expectRows = [
                        [4, "bar", "buz"],
                        [3, "bar", "buz"],
                        [2, "bar", "buz"],
                        [1, "bar", "buz"]
                    ],
                    sortedRows = wrapper.vm.getSortedRows(wrapper.vm.data.items, "foo", "desc");

                expect(sortedRows).to.deep.equal(expectRows);
            });
        });
        describe("runSorting", () => {
            it("should call expected functions", () => {
                const wrapper = shallowMount(TableComponent, {
                        propsData: {
                            data: {}
                        },
                        localVue
                    }),
                    getSortOrderStub = sinon.stub(wrapper.vm, "getSortOrder"),
                    getSortedRowsStub = sinon.stub(wrapper.vm, "getSortedRows");

                wrapper.vm.runSorting("foo");
                expect(getSortOrderStub.called).to.be.true;
                expect(getSortedRowsStub.called).to.be.true;
                sinon.restore();
            });
        });
    });
});
