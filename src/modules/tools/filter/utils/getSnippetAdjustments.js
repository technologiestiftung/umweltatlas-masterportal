import isObject from "../../../../utils/isObject.js";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);

/**
 * Returns a list of attrNames of the given snippets.
 * @param {Object[]} snippets the snippets to parse through
 * @returns {String[]} the list of their attrNames without doublings
 */
function getListOfRelevantAttrNames (snippets) {
    if (!Array.isArray(snippets)) {
        return [];
    }
    const result = {};

    snippets.forEach(snippet => {
        if (!isObject(snippet)) {
            return;
        }
        if (typeof snippet.attrName === "string") {
            result[snippet.attrName] = true;
        }
        else if (Array.isArray(snippet.attrName)) {
            snippet.attrName.forEach(attrName => {
                if (typeof attrName === "string") {
                    result[attrName] = true;
                }
            });
        }
    });

    return Object.keys(result);
}

/**
 * Returns an object of all attrNames as keys and their appearences as list of unique values.
 * @param {Object[]} items a list of items to analyse
 * @param {String[]} relevantAttrNames a simple list of attrNames to consider
 * @returns {Object} an object with attrNames as keys and apperences as list of unique values
 */
function getAttrValuesOfItemsGroupedByAttrNames (items, relevantAttrNames) {
    if (!Array.isArray(items) || !Array.isArray(relevantAttrNames)) {
        return {};
    }
    const result = {},
        assoc = {};

    items.forEach(item => {
        if (!isObject(item) || typeof item.get !== "function") {
            return;
        }
        relevantAttrNames.forEach(attrName => {
            if (typeof attrName !== "string") {
                return;
            }
            else if (!isObject(assoc[attrName])) {
                assoc[attrName] = {};
            }
            if (attrName.startsWith("@") && item.get("Datastreams")) {
                const pathArray = attrName.substring(1, attrName.length).split(".").filter(path => path !== "."),
                    dIdx = pathArray[1],
                    observation = pathArray[2],
                    oIdx = pathArray[3],
                    res = pathArray[4],
                    datastreams = item.get("Datastreams");

                if (!isNaN(Number(dIdx)) && observation && !isNaN(Number(oIdx)) && res
                    && datastreams[dIdx]
                    && datastreams[dIdx][observation]
                    && datastreams[dIdx][observation][oIdx]
                    && datastreams[dIdx][observation][oIdx][res]) {
                    assoc[attrName][item.get("Datastreams")[dIdx][observation][oIdx][res]] = true;
                }
                return;
            }
            else if (typeof item.get(attrName) === "undefined") {
                return;
            }
            assoc[attrName][item.get(attrName)] = true;
        });
    });

    Object.entries(assoc).forEach(([attrName, obj]) => {
        result[attrName] = [];
        Object.keys(obj).forEach(value => {
            result[attrName].push(value);
        });
    });
    return result;
}

/**
 * The compare function for values relevant for snippet type date and dateRange.
 * @param {String} a the first element
 * @param {String} b the second element
 * @param {String} format the format a and b are in
 * @returns {Number} 1 to move first element down, -1 to move first element up
 */
function snippetDateCompareFunction (a, b, format) {
    const momentA = dayjs(a, format),
        momentB = dayjs(b, format);

    if (!momentA.isValid()) {
        return 1;
    }
    else if (!momentB.isValid()) {
        return -1;
    }
    else if (momentA.isSameOrBefore(momentB)) {
        return -1;
    }
    return 1;
}

/**
 * Analysis of the filter answer to adjust snippets with.
 * @param {Object[]} snippets the list of snippets to build the adjustment for
 * @param {Object[]} items the items of the filter answer
 * @param {Number} page the page of the paging object
 * @param {Number} total the last page to expect
 * @returns {Object|Boolean} an object with snippetIds as keys and expected adjustments as values or false if anything unexpected happend
 */
function getSnippetAdjustments (snippets, items, page, total) {
    if (
        !Array.isArray(snippets)
        || !Array.isArray(items)
        || typeof page !== "number"
    ) {
        return false;
    }
    const relevantAttrNames = getListOfRelevantAttrNames(snippets),
        valueByAttrName = getAttrValuesOfItemsGroupedByAttrNames(items, relevantAttrNames),
        result = {
            start: page === 1,
            finish: page >= total
        };

    snippets.forEach(snippet => {
        if (
            typeof snippet.snippetId !== "number"
            || typeof snippet.type !== "string"
            || typeof snippet.attrName === "string" && !Array.isArray(valueByAttrName[snippet.attrName])
            || Array.isArray(snippet.attrName) && !snippet.attrName.every(value => Array.isArray(valueByAttrName[value]))
        ) {
            return;
        }
        if (snippet.type === "dropdown") {
            if (Array.isArray(snippet.attrName)) {
                result[snippet.snippetId] = {
                    value: getMergedValuesByAttrNames(snippet.attrName, valueByAttrName)
                };
                return;
            }
            result[snippet.snippetId] = {
                value: valueByAttrName[snippet.attrName]
            };
        }
        else if (snippet.type === "slider" || snippet.type === "sliderRange") {
            const mergedValue = Array.isArray(snippet.attrName) ?
                    getMergedValuesByAttrNames(snippet.attrName, valueByAttrName) : valueByAttrName[snippet.attrName],
                len = mergedValue.length;
            let min = false,
                max = false,
                val = 0;

            for (let i = 0; i < len; i++) {
                val = parseFloat(mergedValue[i]);
                if (isNaN(val)) {
                    continue;
                }
                if (min === false || min > val) {
                    min = val;
                }
                if (max === false || max < val) {
                    max = val;
                }
            }
            result[snippet.snippetId] = {
                min,
                max
            };
        }
        else if (snippet.type === "date" || snippet.type === "dateRange") {
            const format = typeof snippet.format === "string" ? snippet.format : "YYYY-MM-DD",
                values = Array.isArray(snippet.attrName) ? getMergedValuesByAttrNames(snippet.attrName, valueByAttrName) : valueByAttrName[snippet.attrName],
                sortedValue = Array.isArray(values) ? values.sort((a, b) => {
                    return snippetDateCompareFunction(a, b, format);
                }) : [];

            result[snippet.snippetId] = {
                min: sortedValue[0],
                max: sortedValue[sortedValue.length - 1]
            };
        }
        else if (snippet.type === "featureInfo") {
            Object.entries(valueByAttrName).forEach(([key, value]) => {
                if (Array.isArray(snippet.attrName) && snippet.attrName.includes(key)) {
                    if (!isObject(result[snippet.snippetId])) {
                        result[snippet.snippetId] = {};
                    }
                    result[snippet.snippetId][key] = value;
                }
            });
        }
    });

    return result;
}

/**
 * Gets a merged array of values for given attrNames array.
 * @param {String[]} attrNames The attrNames to get the values for.
 * @param {Object} values The values object to get the values from.
 * @returns {*[]} The values for all attrNames.
 */
function getMergedValuesByAttrNames (attrNames, values) {
    const result = [];

    attrNames.forEach(attributeName => {
        if (typeof values[attributeName] === "undefined") {
            return;
        }
        if (Array.isArray(values[attributeName])) {
            result.push(...values[attributeName]);
            return;
        }
        result.push(values[attributeName]);
    });

    return result;
}

export {
    getMergedValuesByAttrNames,
    getListOfRelevantAttrNames,
    getAttrValuesOfItemsGroupedByAttrNames,
    snippetDateCompareFunction,
    getSnippetAdjustments
};
