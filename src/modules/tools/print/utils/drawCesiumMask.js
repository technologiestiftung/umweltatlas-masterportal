let state = null;

/**
 * Draws the mask based on the given scaling
 * @param {olcs.OLCesium} ol3d The ol 3d map
 * @param {function(): number[]} getScaling compute scaling
 * @returns {void}
 */
function autoDrawMask (ol3d, getScaling) {
    const scene = ol3d.getCesiumScene(),
        canvas = scene.canvas,
        ctx = canvas.getContext("webgl2") || canvas.getContext("webgl");

    if (getScaling) {
        if (!state) {
            state = {
                unlisten: scene.postRender.addEventListener(() => {
                    state.draw(getScaling());
                }),
                draw: main(ctx)
            };
        }
    }
    else if (state) {
        state.unlisten();
        // FIXME: destroy program
        state = null;
    }
    scene.requestRender();
}
// CC0 from https://github.com/mdn/dom-examples/tree/main/webgl-examples/tutorial/sample2
/**
 * Draws a scene
 * @param {WebGL2RenderingContext} gl context
 * @param {*} programInfo program and associated structures
 * @param {WebGLBuffer} buffers position buffer
 * @param {number[]} scaling scaling
 * @returns {void}
 */
function drawScene (gl, programInfo, buffers, scaling) {
    // Blend
    gl.enable(gl.BLEND);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
    gl.useProgram(programInfo.program);
    // Draw a first time to fill the stencil area while keeping the destination color
    gl.enable(gl.STENCIL_TEST);
    gl.stencilFunc(
        gl.ALWAYS,
        1,
        0xFF
    );
    gl.stencilOp(
        gl.KEEP,
        gl.KEEP,
        gl.REPLACE
    );
    gl.uniform2fv(
        programInfo.uniformLocations.uScaling,
        scaling
    );
    gl.blendFunc(gl.ZERO, gl.ONE);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    // Now draw again the whole viewport and darken the pixels that are not on the stencil
    gl.stencilFunc(
        gl.EQUAL,
        0,
        0xFF
    );
    gl.stencilOp(
        gl.KEEP,
        gl.KEEP,
        gl.KEEP
    );
    gl.uniform2fv(
        programInfo.uniformLocations.uScaling,
        [1, 1]
    );
    gl.blendFunc(gl.ZERO, gl.SRC_ALPHA);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}
/**
 * Create position buffer.
 * @param {WebGL2RenderingContext} gl context
 * @returns {WebGLBuffer} return buffer
 */
function initPositionBuffer (gl) {
    const positionBuffer = gl.createBuffer(),
        positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    return positionBuffer;
}
/**
 * Main
 * @param {WebGL2RenderingContext} gl context
 * @returns {function(number[]): void} draw function
 */
function main (gl) {
    // Vertex shader program
    const vsSource = `
    attribute vec4 aVertexPosition;
    uniform vec2 uScaling;
    void main() {
      gl_Position = vec4(aVertexPosition[0] * uScaling[0], aVertexPosition[1] * uScaling[1], -1.0, 1.0);
    }
`,
        fsSource = `
    precision highp float;
    void main() {
      gl_FragColor = vec4(0.5, 0.5, .5, 0.6);
    }
  `,
        shaderProgram = initShaderProgram(gl, vsSource, fsSource),
        programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition")
            },
            uniformLocations: {
                uScaling: gl.getUniformLocation(
                    shaderProgram,
                    "uScaling"
                )
            }
        },
        buffers = initPositionBuffer(gl);

    return (scaling) => {
        drawScene(gl, programInfo, buffers, scaling);
    };
}
/**
 * Initialize the shader
 * @param {WebGL2RenderingContext} gl context
 * @param {string} vsSource shader
 * @param {string} fsSource shader
 * @returns {WebGLProgram} program
 */
function initShaderProgram (gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource),
        fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource),
        shaderProgram = gl.createProgram();

    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    // If creating the shader program failed, alert
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        throw new Error(
            `Unable to initialize the shader program: ${gl.getProgramInfoLog(
                shaderProgram
            )}`
        );
    }
    return shaderProgram;
}
/**
 * Loads a shader and returns it
 * @param {WebGL2RenderingContext} gl context
 * @param {number} type shader type
 * @param {string} source shader source
 * @returns {WebGLShader} shader
 */
function loadShader (gl, type, source) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(
            `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`
        );
        // gl.deleteShader(shader);
    }
    return shader;
}

export default {
    autoDrawMask,
    drawScene,
    initPositionBuffer,
    main,
    initShaderProgram,
    loadShader
};
