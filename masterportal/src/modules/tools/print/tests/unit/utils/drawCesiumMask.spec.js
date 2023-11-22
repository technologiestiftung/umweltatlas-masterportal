import {expect} from "chai";
import sinon from "sinon";
import drawCesiumMask from "../../../utils/drawCesiumMask";

describe("drawCesiumMask", () => {

    afterEach(() => {
        sinon.restore();
    });

    describe("autoDrawMask", () => {
        it("should call expected function", () => {
            const testStub = sinon.stub(),
                ol3d = {
                    getCesiumScene: () => {
                        const scene = {
                            events: [],
                            postRender: {
                                addEventListener: (evt) => {
                                    scene.events.push(evt);
                                    return () => sinon.stub();
                                }
                            },
                            requestRender: testStub,
                            canvas: document.createElement("canvas")
                        };

                        return scene;
                    }
                };

            drawCesiumMask.autoDrawMask(ol3d);
            expect(testStub.called).to.be.true;
        });
    });

    describe("drawScene", () => {
        it("should call expected functions", () => {
            const enable = sinon.stub(),
                bindBuffer = sinon.stub(),
                vertexAttribPointer = sinon.stub(),
                enableVertexAttribArray = sinon.stub(),
                useProgram = sinon.stub(),
                stencilFunc = sinon.stub(),
                stencilOp = sinon.stub(),
                uniform2fv = sinon.stub(),
                blendFunc = sinon.stub(),
                drawArrays = sinon.stub(),
                gl = {
                    enable,
                    bindBuffer,
                    vertexAttribPointer,
                    enableVertexAttribArray,
                    useProgram,
                    stencilFunc,
                    stencilOp,
                    uniform2fv,
                    blendFunc,
                    drawArrays
                },
                programInfo = {
                    uniformLocations: {
                        uScaling: "foo"
                    },
                    attribLocations: {
                        vertexPosition: "foo"
                    }
                };

            drawCesiumMask.drawScene(gl, programInfo);
            expect(enable.called).to.be.true;
            expect(bindBuffer.called).to.be.true;
            expect(vertexAttribPointer.called).to.be.true;
            expect(enableVertexAttribArray.called).to.be.true;
            expect(useProgram.called).to.be.true;
            expect(stencilFunc.called).to.be.true;
            expect(stencilOp.called).to.be.true;
            expect(uniform2fv.called).to.be.true;
            expect(blendFunc.called).to.be.true;
            expect(drawArrays.called).to.be.true;
        });
    });

    describe("initPositionBuffer", () => {
        it("should return expected buffer", () => {
            const gl = {
                createBuffer: () => "foo",
                bindBuffer: sinon.stub(),
                bufferData: sinon.stub()
            };

            expect(drawCesiumMask.initPositionBuffer(gl)).to.be.equal("foo");
        });
    });

    describe("initShaderProgram", () => {
        it("should throw an error if getProgramParameter returns false", () => {
            sinon.stub(drawCesiumMask, "loadShader");
            const gl = {
                createProgram: () => "foo",
                attachShader: sinon.stub(),
                linkProgram: sinon.stub(),
                getProgramParameter: () => false,
                createShader: sinon.stub(),
                shaderSource: sinon.stub(),
                compileShader: sinon.stub(),
                getProgramInfoLog: sinon.stub(),
                getShaderParameter: sinon.stub().returns(true)
            };

            expect(() => drawCesiumMask.initShaderProgram(gl)).to.throw(/Unable to initialize the shader program/);
        });
        it("should return expected shader", () => {
            sinon.stub(drawCesiumMask, "loadShader");
            const gl = {
                createProgram: () => "foo",
                attachShader: sinon.stub(),
                linkProgram: sinon.stub(),
                getProgramParameter: () => true,
                createShader: sinon.stub(),
                shaderSource: sinon.stub(),
                compileShader: sinon.stub(),
                getShaderParameter: sinon.stub().returns(true)
            };

            expect(drawCesiumMask.initShaderProgram(gl)).to.be.equal("foo");
        });
    });

    describe("loadShader", () => {
        it("should throw error if getShaderParameter returns false", () => {
            const gl = {
                createShader: () => "foo",
                shaderSource: sinon.stub(),
                compileShader: sinon.stub(),
                getShaderInfoLog: sinon.stub(),
                getShaderParameter: sinon.stub().returns(false)
            };

            expect(() => drawCesiumMask.loadShader(gl)).to.throw(/An error occurred compiling the shaders/);
        });
        it("should returns expected shader", () => {
            const gl = {
                createShader: () => "foo",
                shaderSource: sinon.stub(),
                compileShader: sinon.stub(),
                getShaderParameter: sinon.stub().returns(true)
            };

            expect(drawCesiumMask.loadShader(gl)).to.be.equal("foo");
        });
    });
});
