import * as cheerio from "cheerio";
import fs from "fs";
import async from "async";
import path from "path";
import axios from "axios";
// const { config } = require("process");
import fetch from "node-fetch";
import services from "./services-internet.js";
import servicesMasterLight from "./services-internet-masterportallight.js";
import missingServices from "./missingServices.js";
services.push(...missingServices);
const nameChapterNumberLookup = {};
const servicesWant = [];
const fachdaten = {
    Ordner: [],
};

const unwantedLayers = [
    "Hintergrund ISU 5 2010",
    "Gleise aus K5",
    "Hintergrund ISU 5 2005",
    "Bezirksname",
    "Straßennamen",
    "Hintergrund ISU50 2001",
    "Hintergrund",
    "Hintergrund ISU5 2010",
    "Strassennamen",
    "Luftbilder Berlin 2014 (Orthophotos)",
    "Aufnahmepunkte",
    "Hintergrund dig. Karte 1:50.000",
    "Kürzel",
    "Texte geomorphologischer Einheiten",
];

const unwantedIds = ["k01_06_07ph2010:2", "k01_06_07ph2010:3"];

function findServiceById(idName) {
    let oneService;
    oneService = services.filter((object) => object.id === idName)[0];
    if (!oneService) {
        oneService = servicesMasterLight.filter(
            (object) => object.id === idName
        )[0];
    }

    return oneService;
}

async function getData(iframeLink) {
    const res = await fetch(iframeLink + "config.json", {
        method: "POST",
        body: "a=1",
    });
    return await res.json();
}

try {
    const response = await axios.get(`https://www.berlin.de/umweltatlas/`);
    const body = response.data;
    const $ = cheerio.load(body);
    const subjectGroupLinks = $("article .inner .more")
        .map((i, el) => $(el).attr("href"))
        .get();
    eachGroup(subjectGroupLinks);
} catch (error) {
    console.error(error);
}

function eachGroup(subjectGroupLinks) {
    // each group: boden, wasser, luft ...
    async.eachSeries(
        subjectGroupLinks,
        function (groupLink, callbackTwo) {
            console.log("Gruppe: ", groupLink);
            axios.get("https://www.berlin.de" + groupLink).then((response) => {
                const body = response.data;
                const $ = cheerio.load(body);
                const title = $(".herounit-article h1").text();
                const group = {
                    Titel: title,
                    isFolderSelectable: false,
                    Ordner: [],
                };
                fachdaten.Ordner.push(group);

                const subGroupLinks = $("article .inner .more")
                    .map((i, el) => $(el).attr("href"))
                    .get();

                eachSubGroup(subGroupLinks, group);
            });
        },
        function (err) {
            console.log("DONE Gruppe: ");
        }
    );
}

function eachSubGroup(subGroupLinks, group) {
    // each sub group
    async.eachSeries(
        subGroupLinks,
        function (subGroupLink, callbackEachSubGroup) {
            console.log("subGroupLink: ", subGroupLink);
            // const temp = "/umweltatlas/boden/rieselfelder/";
            axios
                .get("https://www.berlin.de" + subGroupLink)
                .then((response) => {
                    // axios.get("https://www.berlin.de" + temp).then((response) => {
                    const body = response.data;
                    const $ = cheerio.load(body);
                    const title = $(".herounit-article h1").text();
                    const subGroup = {
                        Titel: title,
                        isFolderSelectable: false,
                        Ordner: [],
                    };
                    group.Ordner.push(subGroup);

                    const subGroupYearLinks = $(
                        "#layout-grid__area--maincontent section:first .textile a"
                    )
                        .map((i, el) => $(el).attr("href"))
                        .get();

                    // console.log("subGroupYearLinks", subGroupYearLinks);
                    eachYearOfSubGroup(
                        subGroupYearLinks,
                        subGroup,
                        callbackEachSubGroup
                    );
                });
        },
        function (err) {
            fs.writeFile(
                "./out/done.json",
                JSON.stringify(fachdaten),
                (err) => {
                    fs.writeFile(
                        "./out/newservices.json",
                        JSON.stringify(servicesWant),
                        (err) => {
                            console.log("!DONE!");
                        }
                    );
                }
            );
        }
    );
}

function eachYearOfSubGroup(subGroupYearLinks, subGroup, callbackEachSubGroup) {
    const subSubGroups = {};
    // each year of a sub group
    async.eachSeries(
        subGroupYearLinks,
        function (subGroupYearLink, eachYearCallback) {
            console.log("subGroupYearLink: ", subGroupYearLink);
            axios
                .get(
                    "https://www.berlin.de" +
                        subGroupYearLink.replace("zusammenfassung", "karten")
                )
                .then((response) => {
                    const body = response.data;
                    const $ = cheerio.load(body);

                    const subSubGroupLinksNames = [];
                    const articles = $("article").get();
                    articles.forEach((a) => {
                        const link = $(a).find(".inner .more").attr("href");
                        const name = $(a).find("h3").text();

                        const nameChapterNumber = !/[^0-9.]/.test(
                            name.split(" ")[0]
                        )
                            ? name.split(" ")[0]
                            : false;

                        if (
                            nameChapterNumber &&
                            !nameChapterNumberLookup[nameChapterNumber]
                        ) {
                            nameChapterNumberLookup[nameChapterNumber] = name;
                        }

                        subSubGroupLinksNames.push({
                            link: link,
                            name: name,
                            nameChapterNumber: nameChapterNumber,
                            nameNorm:
                                // @to decide on name
                                nameChapterNumberLookup[nameChapterNumber] ||
                                name,
                        });
                    });

                    // console.log("subSubGroupLinksNames", subSubGroupLinksNames);

                    goToEachMap(
                        subSubGroupLinksNames,
                        subSubGroups,
                        eachYearCallback
                    );
                });
        },
        function (err) {
            // when done with all subSub Groups and all years
            const newData = {};
            // remove groups names that have only one entry
            Object.keys(subSubGroups).forEach((d) => {
                if (Object.keys(subSubGroups[d]).length === 1) {
                    newData[d] = Object.values(subSubGroups[d])[0];
                } else {
                    newData[d] = subSubGroups[d];
                }
            });

            // use the scraped data and put it in the master portal tree logic
            const newDataFolderStructure = [];
            function toFolderStructure(inputData, structuredData) {
                Object.keys(inputData).forEach((key) => {
                    const keys = Object.keys(inputData[key]);
                    const hasLayers = inputData[key][keys[0]]?.year;
                    if (hasLayers) {
                        structuredData.push({
                            Titel: key,
                            isFolderSelectable: false,
                            Layer: keys.map((layerKey) => ({
                                id: inputData[key][layerKey].id,
                                name: inputData[key][layerKey].name,
                            })),
                        });
                    } else {
                        const subssss = [];
                        structuredData.push({
                            Titel: key,
                            isFolderSelectable: false,
                            Ordner: subssss,
                        });

                        toFolderStructure(inputData[key], subssss);
                    }
                });
            }
            toFolderStructure(newData, newDataFolderStructure);

            subGroup.Ordner.push(...newDataFolderStructure);

            console.log("DONE fachdaten");

            callbackEachSubGroup();
        }
    );
}

function goToEachMap(subSubGroupLinksNames, subSubGroups, eachYearCallback) {
    // go to every sub group

    async.eachSeries(
        subSubGroupLinksNames,
        function (subSubGroupLinkName, callback) {
            const year = subSubGroupLinkName.link.split("/")[4];
            if (!subSubGroups[subSubGroupLinkName.nameNorm]) {
                subSubGroups[subSubGroupLinkName.nameNorm] = {};
            }
            axios
                .get("https://www.berlin.de" + subSubGroupLinkName.link)
                .then((response) => {
                    const body = response.data;
                    const $ = cheerio.load(body);

                    const beschreibungLink =
                        "https://www.berlin.de" +
                        $(".modul-text_bild:first li a").attr("href");

                    let iframeLink = $("iframe").attr("src");
                    iframeLink = iframeLink.replace("?lng=de", "");
                    // console.log("iframeLink", iframeLink);
                    getData(iframeLink).then(function (data) {
                        const fachdaten = data.Themenconfig.Fachdaten.Layer;
                        fachdaten.forEach((d) => {
                            let service = findServiceById(d.id);
                            if (!service) {
                                service = {
                                    id: d.id,
                                    missing: true,
                                    name: "missing service",
                                };
                                console.log("missing service", d.id);
                            }

                            if(service?.datasets[0]){
                                if(!service?.datasets[0].csw_url){
                                    service?.datasets[0].csw_url = "https://gdi.berlin.de/geonetwork/srv/ger/csw"
                                }
                            }

                            // add link to beschreibung
                            service.infoURL = beschreibungLink;
                            servicesWant.push(service);
                            const name = service.name;

                            if (
                                unwantedLayers.includes(name) ||
                                unwantedIds.includes(d.id)
                            ) {
                                console.log("missing service return ", d.id);
                                return;
                            }

                            if (
                                !subSubGroups[subSubGroupLinkName.nameNorm][
                                    name
                                ]
                            ) {
                                subSubGroups[subSubGroupLinkName.nameNorm][
                                    name
                                ] = {};
                            }

                            subSubGroups[subSubGroupLinkName.nameNorm][name][
                                year
                            ] = {
                                year: year,
                                name: `${year} - ${name}`,
                                id: d.id,
                            };
                        });
                        callback();
                    });
                });
        },
        function (err) {
            // console.log("DONe one year: ", JSON.stringify(subSubGroups));
            eachYearCallback();
        }
    );
}

