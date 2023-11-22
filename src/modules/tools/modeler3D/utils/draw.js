/**
 * Returns a position, at which a cylinder is above ground.
 * @param {Cesium.Entity} cylinder - the cylinder
 * @param {Cesium.Cartesian3} position - the position that should get normalized
 * @returns {Cesium.Cartesian3} - the normalized position
 */
export function adaptCylinderToGround (cylinder, position) {
    const newPosition = position ? position : {x: 1, y: 1, z: 1},
        scene = mapCollection.getMap("3D").getCesiumScene(),
        cartographic = Cesium.Cartographic.fromCartesian(newPosition);

    cartographic.height = scene.globe.getHeight(cartographic) + cylinder.cylinder.length._value / 2;

    return Cesium.Cartographic.toCartesian(cartographic);
}

/**
 * Returns a position, at which a cylinder is above ground.
 * @param {Cesium.Entity} entity - the entity that should be ignored by sampleHeight
 * @param {Cesium.Entity} cylinder - the cylinder
 * @param {Cesium.Cartesian3} position - the position that should get normalized
 * @returns {Cesium.Cartesian3} - the normalized position
 */
export function adaptCylinderToEntity (entity, cylinder, position) {
    const scene = mapCollection.getMap("3D").getCesiumScene(),
        cartographic = Cesium.Cartographic.fromCartesian(position),
        sampledHeight = scene.sampleHeight(cartographic, [entity, cylinder]),
        heightDelta = entity.polygon ? entity.polygon.extrudedHeight - sampledHeight : sampledHeight;

    cylinder.cylinder.length = heightDelta + 5;

    cartographic.height = sampledHeight + cylinder.cylinder.length._value / 2;

    return Cesium.Cartographic.toCartesian(cartographic);
}

/**
 * Returns a position, at which a cylinder with the given length is above terrain.
 * @param {Cesium.Entity} cylinder - the cylinder
 * @param {Cesium.Cartesian3} position - the position that should get normalized
 * @returns {Cesium.Cartesian3} - the normalized position
 */
export function adaptCylinderUnclamped (cylinder, position) {
    const newPosition = position ? position : {x: 1, y: 1, z: 1},
        cartographic = Cesium.Cartographic.fromCartesian(newPosition);

    cartographic.height += cylinder.cylinder.length._value / 2;

    return Cesium.Cartographic.toCartesian(cartographic);
}
