module.exports = () => `

uniform float uTime;
uniform vec3 uFirePos;
attribute float aLifetime;
attribute vec2 aTextureCoords;
attribute vec2 aTriCorner;
attribute vec3 aCenterOffset;
attribute vec3 aVelocity;
uniform mat4 uPMatrix;
uniform mat4 uViewMatrix;
uniform bool uUseBillboarding;
varying float vLifetime;
varying vec2 vTextureCoords;

void main (void) {
  float time = mod(uTime, aLifetime);
  vec4 position = vec4(uFirePos + aCenterOffset + (time * aVelocity), 1.0);
  
  vLifetime = 1.3 - (time / aLifetime);
  vLifetime = clamp(vLifetime, 0.0, 1.0);
  float size = (vLifetime * vLifetime) * 0.05;
  
  if (uUseBillboarding) {
    vec3 cameraRight = vec3(uViewMatrix[0].x, uViewMatrix[1].x, uViewMatrix[2].x);
    vec3 cameraUp = vec3(uViewMatrix[0].y, uViewMatrix[1].y, uViewMatrix[2].y);
    position.xyz += (cameraRight * aTriCorner.x * size) + (cameraUp * aTriCorner.y * size);
  } else {
    position.xy += aTriCorner.xy * size;
  }

  gl_Position = uPMatrix * uViewMatrix * position;

  vTextureCoords = aTextureCoords;
  vLifetime = aLifetime;
}
`