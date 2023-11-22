import crs from "@masterportal/masterportalapi/src/crs";
import proj4 from "proj4";

/**
 * Gets the projections in proj4 format.
 *
 * @param {String} destProj Destination projection name.
 * @returns {Object} An object with the definitions of the given projection names.
 */
export default function getProjections (destProj) {
    const mapProjection = crs.getMapProjection(mapCollection.getMap("2D")),
        projectionFromConfig = crs.getProjections().find(projection => {
            return projection.name.includes(mapProjection.split(":")[1]);
        }),
        zone = projectionFromConfig?.zone || "",
        namedProjection = Config.namedProjections.find(projection => projection[0] === mapProjection),
        projectionString = namedProjection
            ? namedProjection.join(", ")
            : `${mapProjection}, +proj=utm +zone=${zone} +ellps=WGS84 +towgs84=0,0,0,0,0,0,1 +units=m +no_defs`;

    proj4.defs(projectionString);

    return {
        sourceProj: proj4(mapProjection),
        destProj: proj4(destProj)
    };
}
