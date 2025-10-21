export const shaders = {
  stars: {
    vertex: `#version 300 es
    precision highp float;
    layout(location = 0) in vec3 position;
    layout(location = 1) in vec3 velocity;
    layout(location = 2) in float size;
    uniform mat4 uProjection;
    uniform float uTime;
    out float vOpacity;
    out float vSize;
    void main() {
      vec3 pos = position + velocity * uTime * 0.05;
      float dist = length(pos);
      vOpacity = clamp(1.0 - dist * 0.0025, 0.05, 1.0);
      vSize = size * mix(0.5, 1.4, vOpacity);
      gl_Position = uProjection * vec4(pos, 1.0);
      gl_PointSize = vSize;
    }
  `,
    fragment: `#version 300 es
    precision highp float;
    out vec4 fragColor;
    in float vOpacity;
    in float vSize;
    uniform vec3 uAccent;
    highp float rand(vec2 co){
      highp float a = 12.9898;
      highp float b = 78.233;
      highp float c = 43758.5453;
      highp float dt= dot(co.xy ,vec2(a,b));
      highp float sn= mod(dt,3.141592653589793);
      return fract(sin(sn) * c);
    }
    void main() {
      vec2 uv = gl_PointCoord * 2.0 - 1.0;
      float d = dot(uv, uv);
      if (d > 1.0) discard;
      float falloff = pow(1.0 - d, 2.0);
      float sparkle = 0.4 + rand(uv + vSize) * 0.6;
      vec3 color = mix(vec3(0.1, 0.12, 0.3), uAccent, falloff * sparkle);
      fragColor = vec4(color, vOpacity * falloff);
    }
  `,
  },
  nebula: {
    vertex: `#version 300 es
    precision highp float;
    const vec2 quad[3] = vec2[3](
      vec2(-1.0, -1.0),
      vec2(3.0, -1.0),
      vec2(-1.0, 3.0)
    );
    out vec2 vUv;
    void main() {
      vUv = quad[gl_VertexID] * 0.5 + 0.5;
      gl_Position = vec4(quad[gl_VertexID], 0.0, 1.0);
    }
  `,
    fragment: `#version 300 es
    precision highp float;
    out vec4 fragColor;
    in vec2 vUv;
    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec3 uAccent;
    uniform vec3 uAccent2;

    vec3 hash3(vec2 p) {
      vec3 q = vec3(dot(p, vec2(127.1, 311.7)),
                    dot(p, vec2(269.5, 183.3)),
                    dot(p, vec2(419.2, 371.9)));
      return fract(sin(q) * 43758.5453);
    }

    float simplex(vec3 p) {
      const float F3 = 1.0 / 3.0;
      const float G3 = 1.0 / 6.0;
      vec3 s = floor(p + dot(p, vec3(F3)));
      vec3 x = p - s + dot(s, vec3(G3));
      vec3 e = step(vec3(0.0), x - vec3(x.yzx));
      vec3 i1 = e * (1.0 - vec3(e.zxy));
      vec3 i2 = 1.0 - vec3(e.zxy) * (1.0 - e);
      vec3 x1 = x - i1 + G3;
      vec3 x2 = x - i2 + 2.0 * G3;
      vec3 x3 = x - 1.0 + 3.0 * G3;
      vec4 w = vec4(dot(x, x), dot(x1, x1), dot(x2, x2), dot(x3, x3));
      vec4 m = max(0.6 - w, 0.0);
      m = m * m;
      vec4 xw = vec4(dot(x, hash3(s.xy)), dot(x1, hash3((s + i1).xy)),
                     dot(x2, hash3((s + i2).xy)), dot(x3, hash3((s + 1.0).xy)));
      return 42.0 * dot(m * m, xw);
    }

    float fbm(vec3 p) {
      float value = 0.0;
      float amplitude = 0.55;
      for (int i = 0; i < 5; i++) {
        value += amplitude * simplex(p);
        p *= 2.2;
        amplitude *= 0.55;
      }
      return value;
    }

    void main() {
      vec2 uv = vUv * 2.0 - 1.0;
      uv.x *= uResolution.x / uResolution.y;
      float time = uTime * 0.04;
      float density = fbm(vec3(uv * 1.5, time));
      float glow = smoothstep(0.2, 0.9, density);
      vec3 color = mix(uAccent2 * 0.2, uAccent * 0.6, glow);
      vec3 finalColor = mix(vec3(0.02, 0.01, 0.04), color, glow);
      float alpha = clamp(glow * 0.65, 0.0, 0.75);
      fragColor = vec4(finalColor, alpha);
    }
  `,
  },
  post: {
    vertex: `#version 300 es
    precision highp float;
    const vec2 quad[3] = vec2[3](
      vec2(-1.0, -1.0),
      vec2(3.0, -1.0),
      vec2(-1.0, 3.0)
    );
    out vec2 vUv;
    void main() {
      vUv = quad[gl_VertexID] * 0.5 + 0.5;
      gl_Position = vec4(quad[gl_VertexID], 0.0, 1.0);
    }
  `,
    fragment: `#version 300 es
    precision highp float;
    out vec4 fragColor;
    in vec2 vUv;
    uniform sampler2D uScene;
    uniform vec2 uResolution;
    uniform float uBloomStrength;

    vec3 sampleBlur(vec2 uv, float radius) {
      vec2 texel = radius / uResolution;
      vec3 sum = vec3(0.0);
      sum += texture(uScene, uv + texel * vec2(-1.0, -1.0)).rgb;
      sum += texture(uScene, uv + texel * vec2(1.0, -1.0)).rgb;
      sum += texture(uScene, uv + texel * vec2(-1.0, 1.0)).rgb;
      sum += texture(uScene, uv + texel * vec2(1.0, 1.0)).rgb;
      return sum * 0.25;
    }

    void main() {
      vec3 base = texture(uScene, vUv).rgb;
      float brightness = max(max(base.r, base.g), base.b);
      vec3 bloom = sampleBlur(vUv, 2.5) * uBloomStrength;
      float vignette = smoothstep(0.9, 0.2, distance(vUv, vec2(0.5)));
      vec3 color = mix(base + bloom, base, 0.25);
      color *= vignette;
      fragColor = vec4(color, 1.0);
    }
  `,
  },
};
