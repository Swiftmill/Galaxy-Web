import { shaders } from './shaders.js';

export class Nebula {
  constructor(glCore) {
    this.core = glCore;
    this.gl = glCore.gl;
    this.program = glCore.createProgram(shaders.nebula.vertex, shaders.nebula.fragment);
  }

  draw(time, resolution, accent, accent2) {
    const gl = this.gl;
    gl.useProgram(this.program);
    gl.disable(gl.DEPTH_TEST);
    gl.uniform1f(gl.getUniformLocation(this.program, 'uTime'), time);
    gl.uniform2fv(gl.getUniformLocation(this.program, 'uResolution'), resolution);
    gl.uniform3fv(gl.getUniformLocation(this.program, 'uAccent'), accent);
    gl.uniform3fv(gl.getUniformLocation(this.program, 'uAccent2'), accent2);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}
