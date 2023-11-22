import dayjs from "dayjs";
import dayjsUtc from "dayjs/plugin/utc";

dayjs.extend(dayjsUtc);

/**
* Checks TimezoneOffset.
* @param {Date} date The date to check.
* @returns {Number} Timezoneoffset
* @link https://stackoverflow.com/questions/11887934/how-to-check-if-dst-daylight-saving-time-is-in-effect-and-if-so-the-offset
*/
function stdTimezoneOffset (date) {
    const jan = new Date(date.getFullYear(), 0, 1),
        jul = new Date(date.getFullYear(), 6, 1);

    return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
}

/**
* Checks if timestamp is in daylight saving time
* @param {Timestamp} timestamp The timestamp to check.
* @returns {Boolean} true if timestamp is in daylight saving time
* @link https://stackoverflow.com/questions/11887934/how-to-check-if-dst-daylight-saving-time-is-in-effect-and-if-so-the-offset
*/
function isDstObserved (timestamp) {
    return new Date(timestamp).getTimezoneOffset() < stdTimezoneOffset(new Date(timestamp));
}

/**
* Change the timzone for the phenomenonTime into a target utc.
* Daylight saving time is considered.
* @param {String} phenomenonTime The phenomenonTime to change.
* @param {String} [utc="+1"] The target timezone.
* @returns {String} The changed phenomenonTime.
*/
function changeTimeZone (phenomenonTime, utc = "+1") {
    const utcAlgebraicSign = utc.substring(0, 1);
    let utcSub,
        utcNumber;

    if (utc.length === 2) {
        utcSub = parseInt(utc.substring(1, 2), 10);
        utcSub = isDstObserved(phenomenonTime) ? utcSub + 1 : utcSub;
        utcNumber = "0" + utcSub + "00";
    }
    else if (utc.length > 2) {
        utcSub = parseInt(utc.substring(1, 3), 10);
        utcSub = isDstObserved(phenomenonTime) ? utcSub + 1 : utcSub;
        utcNumber = utcSub + "00";
    }

    return dayjs(phenomenonTime).utcOffset(utcAlgebraicSign + utcNumber).format("YYYY-MM-DDTHH:mm:ss");
}

export default changeTimeZone;
