import { shaders } from './shaders.js';

export class PostFX {
  constructor(glCore) {
    this.core = glCore;
    this.gl = glCore.gl;
    this.program = glCore.createProgram(shaders.post.vertex, shaders.post.fragment);
    this.framebuffer = null;
  }

  ensureBuffer() {
    const width = this.core.canvas.width;
    const height = this.core.canvas.height;
    if (!this.framebuffer || this.width !== width || this.height !== height) {
      if (this.framebuffer) {
        this.gl.deleteFramebuffer(this.framebuffer.framebuffer);
        this.gl.deleteTexture(this.framebuffer.texture);
        this.gl.deleteRenderbuffer(this.framebuffer.renderbuffer);
      }
      this.framebuffer = this.core.createFramebuffer(width, height);
      this.width = width;
      this.height = height;
    }
  }

  bind() {
    this.ensureBuffer();
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer.framebuffer);
    this.gl.viewport(0, 0, this.width, this.height);
  }

  draw(bloomStrength = 0.35) {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.useProgram(this.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.framebuffer.texture);
    gl.uniform1i(gl.getUniformLocation(this.program, 'uScene'), 0);
    gl.uniform2f(gl.getUniformLocation(this.program, 'uResolution'), this.width, this.height);
    gl.uniform1f(gl.getUniformLocation(this.program, 'uBloomStrength'), bloomStrength);
    gl.disable(gl.DEPTH_TEST);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}
