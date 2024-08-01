import fs from "fs";

const data = JSON.parse(fs.readFileSync("./out/configFachdaten.json", "utf8"));

console.log("data", data);

function removeYearFromString(input) {
    // Define the regex pattern that matches a year from 1900 to 2050 at the end of the string
    const regex = /\s(19\d{2}|20[0-4]\d|2050)$/;

    // Replace the year with an empty string if it matches the pattern
    return input.replace(regex, "");
}

function removeYearRangeWithSlashFromString(input) {
    // Define the regex pattern that matches a year range from 1900 to 2050 at the end of the string, formatted with a slash
    const regex = /(\b\d{4}\/\d{4})$/;

    // Replace the year range with an empty string if it matches the pattern
    return input.replace(regex, "").trim(); // trim to clean up any resulting leading/trailing spaces
}

function removeYearRangeFromString(input) {
    // Define the regex pattern that matches a year range from 1900 to 2050 at the end of the string
    const regex = /\s(19\d{2}-20[0-4]\d|19\d{2}-2050)$/;

    // Replace the year range with an empty string if it matches the pattern
    return input.replace(regex, "");
}

function replaceNames(input) {
    // Check if the input is an object (and not null or an array)
    if (input !== null && typeof input === "object" && !Array.isArray(input)) {
        // Iterate over the properties of the object
        for (const key in input) {
            if (key === "name") {
                // Replace the value of 'name'
                input[key] = input[key].replace(
                    "fortlaufend-aktualisiert - ",
                    ""
                );
                input[key] = input[key].replace(
                    "fortlaufend-aktualisiert",
                    "0000"
                );
                if (input[key] === "seit-1989") {
                    input[key] = input[key].replace("seit-1989", "0000");
                }

                input[key] = removeYearFromString(input[key]);
                input[key] = removeYearRangeFromString(input[key]);
                input[key] = removeYearRangeWithSlashFromString(input[key]);
            }
            // Recursively process every property to find and replace nested 'name' attributes
            replaceNames(input[key]);
        }
    } else if (Array.isArray(input)) {
        // If the input is an array, process each element of the array
        input.forEach((item) => {
            replaceNames(item);
        });
    }
}

// replace names
replaceNames(data);

function handelData(subSubTops) {
    // check if the elements are years
    const firstEl = subSubTops.elements[0]?.name;
    const folderIsYear = !isNaN(firstEl);

    if (firstEl === "0000" && subSubTops.elements.length === 1) {
        subSubTops.elements = subSubTops.elements[0].elements;
    } else if (
        folderIsYear &&
        subSubTops?.elements &&
        subSubTops?.elements?.length === 1
    ) {
        console.log("firstEl", firstEl, subSubTops.elements);
        subSubTops.elements = subSubTops.elements[0].elements;
    } else if (folderIsYear) {
        subSubTops.elements = subSubTops.elements.reverse();

        let moreThenOneLayer = false;
        let layers = [];
        subSubTops?.elements?.forEach((subSubSubTops) => {
            let amountOfLayers = subSubSubTops.elements.length;
            if (amountOfLayers > 1) {
                moreThenOneLayer = true;
            }
            layers.push(subSubSubTops.elements[0]);
        });
        if (!moreThenOneLayer) {
            subSubTops.elements = layers;
        }
        // console.log("subSubTops", subSubTops);
    } else {
        // console.log("not year", subSubTops);
        // subSubTops?.elements?.forEach((subSubSubTops) => {
        // handelData(subSubTops.elements);
        // });
    }
}

// Main Topics: Luftbilder, Boden, ...
data.elements.forEach((tops) => {
    // sub tops
    tops?.elements?.forEach((subTops) => {
        subTops?.elements?.forEach((subSubTops) => {
            handelData(subSubTops);
        });
    });
});

fs.writeFile(
    "./out/configFachdatenSortedAndCleaned.json",
    JSON.stringify(data),
    (err) => {
        console.log("!DONE!");
    }
);

