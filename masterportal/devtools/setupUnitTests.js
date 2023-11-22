global.ResizeObserver = require("resize-observer-polyfill");

/**
 * Mock for web worker
 */
class Worker {
    /**
     * Constructor
     * @param {String} stringUrl a string representing the URL of the script the worker will execute
     * @returns {void} void
     */
    constructor (stringUrl) {
        this.url = stringUrl;
        this.onmessage = () => {
            // empty
        };
    }

    /**
     * Post message
     * @param {String} msg message
     * @returns {void} void
     */
    postMessage (msg) {
        this.onmessage(msg);
    }
}
// a mock for web worker
global.Worker = Worker;


/**
 * Mock for MutationObserver
 */
class MutationObserver {
    /**
     * Constructor
     * @param {Object} args the args
     * @returns {void} void
     */
    constructor (args) {
        this.args = args;
    }
    /**
     * Fake function.
     * @returns {void}
     */
    disconnect () {
        this.args = null;
    }
    /**
     * Fake function.
     * @param {Object} toObserve to observe
     * @returns {void}
     */
    observe (toObserve) {
        this.args = toObserve;
    }
}
// a mock for MutationObserver
global.MutationObserver = MutationObserver;
