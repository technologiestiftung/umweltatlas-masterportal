import * as cheerio from "cheerio";
import fs from "fs";
import async from "async";
import path from "path";
import axios from "axios";
import fetch from "node-fetch";
import services from "./services-internet-umweltatlas.js";
import baseMaps from "./baseMaps.js";
import nameCorrections from "./nameCorrections.js";

import servicesMasterLight from "./services-internet-masterportallight.js";
import fachdatenImport from "./fachdaten.js";

const nameChapterNumberLookup = {};
const servicesWant = [...baseMaps];

const noMap = [];
const missingServices = [];
const fachdaten = fachdatenImport;

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
    "Hintergrund 1:5.000",
    "Hintergrundkarte ISU50",
];

const unwantedIds = ["k01_06_07ph2010:2", "k01_06_07ph2010:3"];

function fetchWithRetry(url, retries = 3, delay = 4000) {
    return axios
        .get(url)
        .then((response) => {
            // If the request is successful, return the response
            return response;
        })
        .catch((error) => {
            // If the status code is 429 (Too Many Requests), try again after a delay
            if (error.response.status === 429 && retries > 0) {
                console.log(
                    `Request rate limit exceeded. Retrying in ${
                        delay / 1000
                    } seconds...`
                );
                return new Promise((resolve) => {
                    setTimeout(() => {
                        // Recursively try fetching again with one less retry
                        resolve(fetchWithRetry(url, retries - 1, delay));
                    }, delay);
                });
            }
            // If not a rate limit issue or no retries left, reject the promise
            return Promise.reject(error);
        });
}

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
    if (iframeLink.includes("?")) {
        iframeLink = iframeLink.split("?")[0] + "/";
    }
    const res = await fetch(iframeLink + "config.json", {
        method: "POST",
        body: "a=1",
    });
    return await res.json();
}

function eachGroup(subjectGroupLinks) {
    // each group: boden, wasser, luft ...
    async.eachSeries(
        subjectGroupLinks,
        function (groupLink, callbackEachGroup) {
            console.log("Gruppe: ", groupLink);
            fetchWithRetry("https://www.berlin.de" + groupLink).then(
                (response) => {
                    const body = response.data;
                    const $ = cheerio.load(body);
                    const title = $(".herounit-article h1").text();
                    const group = {
                        name: title,
                        type: "folder",
                        elements: [],
                    };
                    fachdaten.elements.push(group);

                    const subGroupLinks = $("article .inner .more")
                        .map((i, el) => $(el).attr("href"))
                        .get();

                    eachSubGroup(subGroupLinks, group, callbackEachGroup);
                }
            );
        },
        function (err) {
            fs.writeFile(
                "./out/configFachdaten.json",
                JSON.stringify(fachdaten),
                (err) => {
                    fs.writeFile(
                        "./out/services.json",
                        JSON.stringify(servicesWant),
                        (err) => {
                            fs.writeFile(
                                "./out/noMap.json",
                                JSON.stringify(noMap),
                                (err) => {
                                    fs.writeFile(
                                        "./out/missingServices.json",
                                        JSON.stringify(missingServices),
                                        (err) => {
                                            console.log("!DONE!");
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        }
    );
}

function eachSubGroup(subGroupLinks, group, callbackEachGroup) {
    // each sub group
    async.eachSeries(
        subGroupLinks,
        function (subGroupLink, callbackEachSubGroup) {
            console.log("subGroupLink: ", subGroupLink);
            // const temp = "/umweltatlas/boden/rieselfelder/";

            fetchWithRetry("https://www.berlin.de" + subGroupLink)
                .then((response) => {
                    // axios.get("https://www.berlin.de" + temp).then((response) => {
                    const body = response.data;
                    const $ = cheerio.load(body);
                    const title = $(".herounit-article h1").text();
                    const subGroup = {
                        name: title,
                        type: "folder",
                        elements: [],
                    };
                    group.elements.push(subGroup);

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
                })
                .catch((error) => {
                    // Handling any errors that occurred during the HTTP request or processing

                    // catch strassenverkehr because it does not exist
                    // https://www.berlin.de/umweltatlas/luft/strassenverkehr-emissionen-und-immissionen/umweltatlas/luft/strassenverkehr-emissionen-und-immissionen

                    console.error(
                        "An error occurred during the request:"
                        // error.message
                    );
                    callbackEachSubGroup();
                    return;
                });
        },
        function (err) {
            console.log("DONE Gruppe: ");

            callbackEachGroup();
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
            fetchWithRetry(
                "https://www.berlin.de" +
                    subGroupYearLink.replace("zusammenfassung", "karten")
            ).then((response) => {
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
                            nameChapterNumberLookup[nameChapterNumber] || name,
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
            console.log(JSON.stringify(subSubGroups));
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

            function toYearFolderStructure(inputData, structuredData) {
                const byYear = {};
                Object.keys(inputData).forEach((key) => {
                    Object.keys(inputData[key]).forEach((keyKey) => {
                        if (!byYear[keyKey]) {
                            byYear[keyKey] = [];
                        }
                        byYear[keyKey].push(inputData[key][keyKey]);
                    });
                });

                Object.keys(byYear).forEach((year) => {
                    structuredData.push({
                        name: year,
                        type: "folder",
                        elements: byYear[year].map((y) => ({
                            id: y.id,
                            name: y.name,
                        })),
                    });
                });
            }

            // use the scraped data and put it in the master portal tree logic
            const newDataFolderStructure = [];
            function toFolderStructure(inputData, structuredData) {
                Object.keys(inputData).forEach((key) => {
                    let keys = Object.keys(inputData[key]);

                    const hasLayers = inputData[key][keys[0]]?.year;
                    if (hasLayers) {
                        structuredData.push({
                            name: key,
                            type: "folder",
                            elements: keys.map((layerKey) => ({
                                id: inputData[key][layerKey].id,
                                name: inputData[key][layerKey].name,
                            })),
                        });
                    } else {
                        const subssss = [];
                        structuredData.push({
                            name: key,
                            type: "folder",
                            elements: subssss,
                        });

                        toYearFolderStructure(inputData[key], subssss);
                    }
                });
            }
            toFolderStructure(newData, newDataFolderStructure);

            subGroup.elements.push(...newDataFolderStructure);

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
            console.log("subSubGroupLinkName.link", subSubGroupLinkName.link);
            fetchWithRetry(
                "https://www.berlin.de" + subSubGroupLinkName.link
            ).then((response) => {
                const body = response.data;
                const $ = cheerio.load(body);

                const descriptionLink = $(".modul-text_bild:first li a").attr(
                    "href"
                )
                    ? "https://www.berlin.de" +
                      $(".modul-text_bild:first li a").attr("href")
                    : "";

                const downloadLink = $(".link--download").attr("href")
                    ? "https://www.berlin.de" +
                      $(".link--download").attr("href")
                    : "";

                const contact = {
                    name: $(".modul-contact .textile p").text()
                        ? $(".modul-contact .textile p").text().trim()
                        : "",
                    tel: $(".modul-contact .tel").text()
                        ? $(".modul-contact .tel")
                              .text()
                              .replaceAll("Tel.:", "")
                              .trim()
                        : "",
                    email: $(".modul-contact .email a").attr("href")
                        ? $(".modul-contact .email a")
                              .attr("href")
                              .replace("mailto:", "")
                        : "",
                };

                let iframeLink = $("iframe").attr("src");
                // no iFrame
                if (!iframeLink) {
                    noMap.push(
                        "https://www.berlin.de" + subSubGroupLinkName.link
                    );
                    callback();
                    return;
                }
                iframeLink = iframeLink.replace("?lng=de", "");

                // console.log("iframeLink", iframeLink);
                getData(iframeLink).then(function (data) {
                    const fachdaten = data.Themenconfig.Fachdaten.Layer;
                    fachdaten.forEach((d) => {
                        let service = findServiceById(d.id);
                        if (!service) {
                            // service = {
                            //     id: d.id,
                            //     missing: true,
                            //     name: "missing service",
                            // };
                            // console.log("missing service", d.id);

                            missingServices.push({
                                iframeLink: iframeLink,
                                id: d.id,
                                // infoURL: descriptionLink,
                                // download: downloadLink,
                                // contact: contact,
                            });

                            return;
                        }

                        // add csw_url to datasets so meta data is displayed
                        if (service?.datasets && service?.datasets[0]) {
                            if (!service?.datasets[0].csw_url) {
                                service.datasets[0].csw_url =
                                    "https://gdi.berlin.de/geonetwork/srv/ger/csw";
                            }
                        }

                        // add link to description
                        service.infoURL = descriptionLink;
                        service.download = downloadLink;
                        service.contact = contact;

                        servicesWant.push(service);
                        let name = service.name;
                        if (nameCorrections[d.id]) {
                            name = nameCorrections[d.id];
                        }

                        if (
                            unwantedLayers.includes(name) ||
                            unwantedIds.includes(d.id)
                        ) {
                            console.log(
                                "unwanted ",
                                "name: ",
                                name,
                                " id:",
                                d.id
                            );
                            return;
                        }

                        if (!subSubGroups[subSubGroupLinkName.nameNorm][name]) {
                            subSubGroups[subSubGroupLinkName.nameNorm][name] =
                                {};
                        }

                        subSubGroups[subSubGroupLinkName.nameNorm][name][year] =
                            {
                                year: year,
                                name: `${year} - ${name}`,
                                id: d.id,
                            };
                    });
                    setTimeout(() => {
                        callback();
                    }, 500);
                });
            });
        },
        function (err) {
            // console.log("DONe one year: ", JSON.stringify(subSubGroups));
            eachYearCallback();
        }
    );
}

// 1 - get links for Subjects e.g. "/umweltatlas/boden/"
try {
    const response = await axios.get(`https://www.berlin.de/umweltatlas/`);
    const body = response.data;
    const $ = cheerio.load(body);
    const subjectGroupLinks = $("article .inner .more")
        .map((i, el) => $(el).attr("href"))
        .get();

    // for testing BODEN
    // const subjectGroupLinks = ["/umweltatlas/boden/"];
    eachGroup(subjectGroupLinks);
} catch (error) {
    // console.error(error);
}

