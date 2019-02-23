module.exports = () => `

precision mediump float;
uniform vec4 uColor;
uniform float uTimeFrag;
varying float vLifetime;
varying vec2 vTextureCoords;
uniform sampler2D fireAtlas;

void main (void) {
 
  float time = mod(uTimeFrag, vLifetime);
  float percentOfLife = time / vLifetime;
  percentOfLife = clamp(percentOfLife, 0.0, 1.0);
  
  float offset = floor(16.0 * percentOfLife);
  float offsetX = floor(mod(offset, 4.0)) / 4.0;
  float offsetY = 0.75 - floor(offset / 4.0) / 4.0;

  vec4 texColor = texture2D(fireAtlas, vec2((vTextureCoords.x / 4.0) + offsetX, (vTextureCoords.y / 4.0) + offsetY));
  gl_FragColor = uColor * texColor;

  // Fade away the particle as it ages
  gl_FragColor.a *= vLifetime;
}

`