/**
 * @description Abstracts the search results of coordinates by text and text by coordinates.
 * @class RoutingGeosearchResult
 */
class RoutingGeosearchResult {
    /**
     * creates new RoutingGeosearchResult
     * @param {Array} coordinates array of coordinates.
     * @param {String} displayName of coordinate.
     * @param {String} epsg coordinate system.
     */
    constructor (coordinates, displayName, epsg) {
        this.coordinates = coordinates;
        this.displayName = displayName;
        this.epsg = epsg;
    }

    /**
     * DisplayName of coordinate.
     * @returns {Number} displayName of coordinate.
     */
    getDisplayName () {
        return this.displayName;
    }
    /**
     * DisplayName coordinate.
     * @param {Number} displayName coordinate.
     * @returns {void}
     */
    setDisplayName (displayName) {
        this.displayName = displayName;
    }

    /**
     * Coordinates in local projection.
     * @returns {[Number, Number]} coordinates in local projection.
     */
    getCoordinates () {
        return this.coordinates;
    }
    /**
     * Coordinates in local projection.
     * @param {[Number, Number]} coordinates in local projection.
     * @returns {void}
     */
    setCoordinates (coordinates) {
        this.coordinates = coordinates;
    }
    /**
     * Coordinate system.
     * @returns {String} coordinate system.
     */
    getEpsg () {
        return this.epsg;
    }
    /**
     * Coordinate system.
     * @param {String} epsg system.
     * @returns {void}
     */
    setEpsg (epsg) {
        this.epsg = epsg;
    }
}

export {RoutingGeosearchResult};
