/**
 * Sorting alorithm that distinguishes between array[objects] and other arrays.
 * arrays[objects] can be sorted by up to 2 object attributes
 * @param {String} type Type of sortAlgorithm
 * @param {array} input array that has to be sorted
 * @param {String} first first attribute an array[objects] has to be sorted by
 * @param {String} second second attribute an array[objects] has to be sorted by
 * @returns {array} sorted array
 */
export function sort (type, input, first, second) {
    let sorted = input;
    const isArray = Array.isArray(sorted),
        isArrayOfObjects = isArray ? sorted.every(element => typeof element === "object") : false;

    if (isArray && !isArrayOfObjects) {
        sorted = sortArray(sorted);
    }
    else if (isArray && isArrayOfObjects) {
        sorted = sortObjects(type, sorted, first, second);
    }

    return sorted;
}

/**
 * Sorts an array.
 * @param {Array} input array to sort.
 * @returns {Array} sorted array
 */
export function sortArray (input) {
    return input.sort(sortAlphaNum);
}

/**
 * Sorting function for alphanumeric sorting. First sorts alphabetically, then numerically.
 * @param {*} a First comparator.
 * @param {*} b Secons comparator.
 * @returns {Number} Sorting index.
 */
export function sortAlphaNum (a, b) {
    const regExAlpha = /[^A-Z]/g,
        regExNum = /[^0-9]/g,
        aAlpha = String(a).replace(regExAlpha, ""),
        bAlpha = String(b).replace(regExAlpha, "");
    let aNum,
        bNum,
        returnVal = -1;

    if (aAlpha === bAlpha) {
        aNum = parseInt(String(a).replace(regExNum, ""), 10);
        bNum = parseInt(String(b).replace(regExNum, ""), 10);
        if (aNum === bNum) {
            returnVal = 0;
        }
        else if (aNum > bNum) {
            returnVal = 1;
        }
    }
    else {
        returnVal = aAlpha > bAlpha ? 1 : -1;
    }
    return returnVal;
}

/**
 * Sorts array of objects basend on the given type.
 * @param {String} type Type of sort algorithm.
 * @param {Object[]} input Array with object to be sorted.
 * @param {String} first First attribute to sort by.
 * @param {String} second Second attribute to sort by.
 * @returns {Object[]} - Sorted array of objects.
 */
export function sortObjects (type, input, first, second) {
    let sortedObj = input;

    if (type === "address") {
        sortedObj = sortObjectsAsAddress(sortedObj, first);
    }
    else {
        sortedObj = sortObjectsNonAddress(first, second, sortedObj);
    }

    return sortedObj;
}

/**
 * Sorts array of objects as address using a special sorting alorithm
 * @param {Object[]} input Array with object to be sorted.
 * @returns {Object[]} - Sorted array of objects.
 */
export function sortObjectsAsAddress (input) {
    return input.sort(sortAddress);
}

/**
 * Sorting Function to sort address.
 * Expected string format to be "STREETNAME HOUSENUMBER_WITH_OR_WITHOUT_SUFFIX, *"
 * @param {String} aObj First comparator.
 * @param {String} bObj Second comparator.
 * @returns {Number} Sorting index.
 */
export function sortAddress (aObj, bObj) {
    const a = aObj.name,
        b = bObj.name,
        aIsValid = isValidAddressString(a, ",", " "),
        bIsValid = isValidAddressString(b, ",", " "),
        aSplit = splitAddressString(a, ",", " "),
        bSplit = splitAddressString(b, ",", " "),
        aFirstPart = aIsValid ? aSplit[0] : a,
        aSecondPart = aIsValid ? aSplit[1] : a,
        bFirstPart = bIsValid ? bSplit[0] : b,
        bSecondPart = bIsValid ? bSplit[1] : b;
    let returnVal = -1;

    if (aFirstPart > bFirstPart) {
        returnVal = 1;
    }
    if (aFirstPart === bFirstPart) {
        returnVal = sortNumAlpha(aSecondPart, bSecondPart);
    }

    return returnVal;
}

/**
 * Splits the address string.
 * @param {String} string Address string.
 * @param {String} separator Separator to separate the Address and Housenumber from other info such as zipCode or City.
 * @param {String} lastOccurrenceChar Character to separate the streetname from the housenumber.
 * @returns {String[]} - Array containing the splitted parts.
 */
export function splitAddressString (string, separator, lastOccurrenceChar) {
    const splitBySeparator = string.split(separator),
        splittedString = [];

    splitBySeparator.forEach(split => {
        const lastOccurrence = split.lastIndexOf(lastOccurrenceChar),
            firstPart = split.substr(0, lastOccurrence).trim(),
            secondPart = split.substr(lastOccurrence).trim();

        splittedString.push(firstPart);
        splittedString.push(secondPart);
    });
    return splittedString;
}

/**
 * Checks if address string is valid for address sorting.
 * The string gets splitted by "separator". The occurrence of the "lastOcccurrenceChar" is checked.
 * @param {String} string String to check.
 * @param {String} separator Separator to separate Address (streetname and housenumber) from additional information (postal code, etc.).
 * @param {String} lastOccurrenceChar Charactor to separate the streetname from the housenumber.
 * @returns {Boolean} - Flag if string is valid.
 */
export function isValidAddressString (string, separator, lastOccurrenceChar) {
    let isValid = false;
    const separatedString = string.split(separator),
        firstPartOfSeparatedString = separatedString[0];

    if (string.indexOf(separator) !== -1 && firstPartOfSeparatedString && firstPartOfSeparatedString.indexOf(lastOccurrenceChar) !== -1) {
        isValid = true;
    }

    return isValid;
}

/**
 * Sorting function for numalpha sorting. First sorts numerically, then alphabetically.
 * @param {*} a First comparator.
 * @param {*} b Second comparator.
 * @returns {Number} Sorting index.
 */
export function sortNumAlpha (a, b) {
    const regExAlpha = /[^a-zA-Z]/g,
        regExNum = /[^0-9]/g,
        aAlpha = String(a).replace(regExAlpha, ""),
        bAlpha = String(b).replace(regExAlpha, ""),
        aNum = parseInt(String(a).replace(regExNum, ""), 10),
        bNum = parseInt(String(b).replace(regExNum, ""), 10);
    let returnVal = -1;

    if (aNum === bNum) {
        if (aAlpha === bAlpha) {
            returnVal = 0;
        }
        else if (aAlpha > bAlpha) {
            returnVal = 1;
        }
    }
    else {
        returnVal = aNum > bNum ? 1 : -1;
    }

    return returnVal;
}

/**
 * Sorts Objects not as address.
 * @param {String} first First attribute to sort by.
 * @param {String} second Second attribute to sort by.
 * @param {Object[]} [input=[]] Array with object to be sorted.
 * @returns {Object[]} - Sorted array of objects.
 */
export function sortObjectsNonAddress (first, second, input = []) {
    const sortedOjectSecond = input.sort((elementA, elementB) => compareInputs(elementA, elementB, second)),
        sortedObjectFirst = sortedOjectSecond.sort((elementA, elementB) => compareInputs(elementA, elementB, first));

    return sortedObjectFirst;
}

/**
 * Compare two elements.
 * @param {object} elementA - The first object.
 * @param {object} elementB - The second object.
 * @param {string|number} value - value by sort.
 * @returns {number} Sort sequence in numbers
 */
export function compareInputs (elementA, elementB, value) {
    const firstElement = convertInputs(elementA[value]),
        secondElement = convertInputs(elementB[value]);

    if (firstElement < secondElement) {
        return -1;
    }
    else if (firstElement > secondElement) {
        return 1;
    }

    return 0;
}

/**
 * Converts the value to expected value.
 * @param {Number|String} value - The value to be converted.
 * @returns {Number|String} the expected value.
 */
export function convertInputs (value) {
    let result = value;

    if (!isNaN(parseInt(result, 10))) {
        result = parseInt(result, 10);
    }
    else if (typeof result === "string") {
        result = result.toUpperCase();
    }

    return result;
}
