import { shaders } from './shaders.js';

const MAX_STARS = 100000;

function randomSphere() {
  const u = Math.random();
  const v = Math.random();
  const theta = u * 2.0 * Math.PI;
  const phi = Math.acos(2.0 * v - 1.0);
  const r = Math.cbrt(Math.random()) * 240.0 + 40.0;
  const sinPhi = Math.sin(phi);
  return [
    r * sinPhi * Math.cos(theta),
    r * sinPhi * Math.sin(theta),
    r * Math.cos(phi),
  ];
}

export class Stars {
  constructor(glCore, density = 1) {
    this.core = glCore;
    this.gl = glCore.gl;
    this.program = glCore.createProgram(shaders.stars.vertex, shaders.stars.fragment);
    this.starCount = 0;
    this.buffers = {};
    this.density = density;
    this.generate();
  }

  generate() {
    const gl = this.gl;
    const qualityMultiplier = this.density;
    const count = Math.floor(MAX_STARS * qualityMultiplier);
    this.starCount = count;

    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i += 1) {
      const pos = randomSphere();
      positions.set(pos, i * 3);
      velocities.set([pos[0] * 0.001, pos[1] * 0.001, pos[2] * 0.001], i * 3);
      sizes[i] = 1.4 + Math.random() * 1.2;
    }

    this.buffers.position = this.core.createBuffer(positions, gl.DYNAMIC_DRAW);
    this.buffers.velocity = this.core.createBuffer(velocities, gl.STATIC_DRAW);
    this.buffers.size = this.core.createBuffer(sizes, gl.STATIC_DRAW);

    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.velocity);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.size);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 1, gl.FLOAT, false, 0, 0);

    gl.bindVertexArray(null);
  }

  updateDensity(density) {
    this.density = density;
    this.generate();
  }

  draw(projection, time, accent) {
    const gl = this.gl;
    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);
    gl.uniformMatrix4fv(gl.getUniformLocation(this.program, 'uProjection'), false, projection);
    gl.uniform1f(gl.getUniformLocation(this.program, 'uTime'), time);
    gl.uniform3fv(gl.getUniformLocation(this.program, 'uAccent'), accent);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.drawArrays(gl.POINTS, 0, this.starCount);
    gl.disable(gl.BLEND);
    gl.bindVertexArray(null);
  }
}
