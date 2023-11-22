import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat);

/**
 * Make the intersects check for array.
 * @param {Number|String} featValueA the feature value a
 * @param {Number|String} featValueB the feature value b
 * @param {Number|String} ruleValueA the rule value a
 * @param {Number|String} ruleValueB the rule value b
 * @param {Number|String} format the format for date
 * @returns {Boolean} true if it is matching intersects check
 */
function intersectsForArray (featValueA, featValueB, ruleValueA, ruleValueB, format) {
    if (!format || !dayjs(featValueA, format).isValid()) {
        return featValueA <= ruleValueB && featValueB >= ruleValueA;
    }

    const featValA = dayjs(featValueA, format),
        featValB = dayjs(featValueB, format),
        ruleValA = dayjs(ruleValueA, format),
        ruleValB = dayjs(ruleValueB, format);

    if (!featValA.isValid() || !featValB.isValid() || !ruleValA.isValid() || !ruleValB.isValid()) {
        return false;
    }

    return featValA.isSameOrBefore(ruleValB) && featValB.isSameOrAfter(ruleValA);
}
/**
 * Make the between check for array.
 * @param {Number|String} featValueA the feature value a
 * @param {Number|String} featValueB the feature value b
 * @param {Number|String} ruleValueA the rule value a
 * @param {Number|String} ruleValueB the rule value b
 * @param {String} format the format for date
 * @returns {Boolean} true if it is matching between check
 */
function betweenForArray (featValueA, featValueB, ruleValueA, ruleValueB, format) {
    if (!format || !dayjs(ruleValueA, format).isValid()) {
        return featValueA >= ruleValueA && featValueB <= ruleValueB;
    }

    const featValA = dayjs(featValueA, format),
        featValB = dayjs(featValueB, format),
        ruleValA = dayjs(ruleValueA, format),
        ruleValB = dayjs(ruleValueB, format);

    if (!featValA.isValid() || !featValB.isValid() || !ruleValA.isValid() || !ruleValB.isValid()) {
        return false;
    }

    return featValA.isSameOrAfter(ruleValA) && featValB.isSameOrBefore(ruleValB);
}
/**
 * Make the equals check for array.
 * @param {String} featValueA the feature value a
 * @param {String[]} value the value
 * @param {String} format the date format
 * @param {String} delimiter the delimiter from rule
 * @returns {Boolean} true if it matches the equals check
 */
function equalsForArray (featValueA, value, format, delimiter) {
    if (!format || !dayjs(featValueA, format).isValid()) {
        if (typeof delimiter === "string") {
            return typeof value.find(v => typeof v === "string" && featValueA.split(delimiter).includes(v.toLowerCase())) !== "undefined";
        }
        return typeof value.find(v => typeof v === "string" && featValueA === v.toLowerCase()) !== "undefined";
    }
    const featValA = dayjs(featValueA, format);

    return typeof value.find(v => dayjs(v, format).isSame(featValA)) !== "undefined";
}
/**
 * Make the in check for array.
 * @param {String} featValueA the feature value a
 * @param {String[]} value the value
 * @returns {Boolean} true if it matches the in check for array
 */
function inForArray (featValueA, value) {
    return typeof featValueA === "string" && typeof value.find(v => typeof v === "string" && featValueA.includes(v.toLowerCase())) !== "undefined";
}
/**
 * Make the startswith check for array.
 * @param {String} featValueA the feature value a
 * @param {String[]} value the value
 * @returns {Boolean} true if it matches the startswith check for array
 */
function startswithForArray (featValueA, value) {
    return typeof featValueA === "string" && typeof value.find(v => typeof v === "string" && featValueA.startsWith(v.toLowerCase())) !== "undefined";
}
/**
 * Make the endswith check for array.
 * @param {String} featValueA the feature value a
 * @param {String[]} value the value
 * @returns {Boolean} true if it matches the endswith check for array
 */
function endswithForArray (featValueA, value) {
    return typeof featValueA === "string" && typeof value.find(v => typeof v === "string" && featValueA.endsWith(v.toLowerCase())) !== "undefined";
}
/**
 * Make the between check.
 * @param {Number|String} featValueA the feature value a
 * @param {Number|String} featValueB the feature value b
 * @param {Number|String} ruleValueA the rule value a
 * @param {String} format the date format
 * @returns {Boolean} true if it matches the between check
 */
function between (featValueA, featValueB, ruleValueA, format) {
    if (!format || !dayjs(ruleValueA, format).isValid()) {
        return featValueA <= ruleValueA && featValueB >= ruleValueA;
    }

    const featValA = dayjs(featValueA, format),
        featValB = dayjs(featValueB, format),
        ruleValA = dayjs(ruleValueA, format);

    if (!featValA.isValid() || !featValB.isValid() || !ruleValA.isValid()) {
        return false;
    }

    return featValA.isSameOrBefore(ruleValA) && featValB.isSameOrAfter(ruleValA);
}
/**
 * Make the equals check.
 * @param {String} featValueA the feature value a
 * @param {String} ruleValueA the rule value a
 * @param {String} format the date format
 * @param {String} delimiter the delimiter from rule
 * @returns {Boolean} true if it matches the equals check
 */
function equals (featValueA, ruleValueA, format, delimiter) {
    const featValA = dayjs(featValueA, format);

    if (!format || !featValA.isValid()) {
        if (typeof delimiter === "string") {
            return featValueA.split(delimiter).includes(ruleValueA);
        }
        return featValueA === ruleValueA;
    }

    return featValA.isSame(dayjs(ruleValueA, format));
}
/**
 * Make the not equals check.
 * @param {String} featValueA the feature value a
 * @param {String} ruleValueA the rule value a
 * @param {String} format the date format
 * @returns {Boolean} true if it matches the not equals check
 */
function ne (featValueA, ruleValueA, format) {
    const featValA = dayjs(featValueA, format);

    if (!format || !featValA.isValid()) {
        return featValueA !== ruleValueA;
    }

    return !featValA.isSame(dayjs(ruleValueA, format));
}
/**
 * Make the greater than check.
 * @param {String} featValueA the feature value a
 * @param {String} ruleValueA the rule value a
 * @param {String} format the date format
 * @returns {Boolean} true if it matches the greater than check
 */
function gt (featValueA, ruleValueA, format) {
    const featValA = dayjs(featValueA, format, true);

    if (!format || !featValA.isValid()) {
        return featValueA > ruleValueA;
    }

    return featValA.isAfter(dayjs(ruleValueA, format));
}
/**
 * Make the greater equals check.
 * @param {String} featValueA the feature value a
 * @param {String} ruleValueA the rule value a
 * @param {String} format the date format
 * @returns {Boolean} true if it matches the greater equals check
 */
function ge (featValueA, ruleValueA, format) {
    const featValA = dayjs(featValueA, format, true);

    if (!format || !featValA.isValid()) {
        return featValueA >= ruleValueA;
    }

    return featValA.isSameOrAfter(dayjs(ruleValueA, format));
}
/**
 * Make the lower than check.
 * @param {String} featValueA the feature value a
 * @param {String} ruleValueA the rule value a
 * @param {String} format the date format
 * @returns {Boolean} true if it matches the lower than check
 */
function lt (featValueA, ruleValueA, format) {
    const featValA = dayjs(featValueA, format);

    if (!format || !featValA.isValid()) {
        return featValueA < ruleValueA;
    }

    return featValA.isBefore(dayjs(ruleValueA, format));
}
/**
 * Make the lower equals check.
 * @param {String} featValueA the feature value a
 * @param {String} ruleValueA the rule value a
 * @param {String} format the date format
 * @returns {Boolean} true if it matches the lower equals check
 */
function le (featValueA, ruleValueA, format) {
    const featValA = dayjs(featValueA, format);

    if (!format || !featValA.isValid()) {
        return featValueA <= ruleValueA;
    }

    return featValA.isSameOrBefore(dayjs(ruleValueA, format));
}
/**
 * Make the includes check.
 * @param {String} featValueA the feature value a
 * @param {String} ruleValueA the rule value a
 * @returns {Boolean} true if it matches the includes check
 */
function inForString (featValueA, ruleValueA) {
    return typeof featValueA === "string" && featValueA.includes(ruleValueA);
}
/**
 * Make the startswith check.
 * @param {String} featValueA the feature value a
 * @param {String} ruleValueA the rule value a
 * @param {String} format the date format
 * @returns {Boolean} true if it matches the startswith check
 */
function startswith (featValueA, ruleValueA) {
    return typeof featValueA === "string" && featValueA.startsWith(ruleValueA);
}
/**
 * Make the endswith check.
 * @param {String} featValueA the feature value a
 * @param {String} ruleValueA the rule value a
 * @param {String} format the date format
 * @returns {Boolean} true if it matches the endswith check
 */
function endswith (featValueA, ruleValueA) {
    return typeof featValueA === "string" && featValueA.endsWith(ruleValueA);
}

export {
    between,
    betweenForArray,
    endswith,
    endswithForArray,
    equals,
    equalsForArray,
    ge,
    gt,
    inForArray,
    inForString,
    intersectsForArray,
    le,
    lt,
    ne,
    startswith,
    startswithForArray
};
