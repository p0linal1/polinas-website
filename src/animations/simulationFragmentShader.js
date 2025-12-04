// import glslCurlNoise from './glslCurlNoise.js';

// const fragmentShader = `

// uniform sampler2D positions;
// uniform float uTime;
// uniform float uFrequency;

// varying vec2 vUv;

// ${glslCurlNoise}
// void main() {
//     vec3 pos = texture2D(positions, vUv).rgb;
//     vec3 curlPos = texture2D(positions, vUv).rgb;

//     pos = curlNoise(pos * uFrequency + uTime * 0.1);
//     curlPos = curlNoise(curlPos * uFrequency + uTime * 0.1);
    
//     curlPos += curlNoise(curlPos * uFrequency * 2.0) * 0.5;

//     gl_FragColor = vec4(mix(pos, curlPos, sin(uTime)), 1.0);
// }
// `

// export default fragmentShader

import glslCurlNoise from './glslCurlNoise.js';

const fragmentShader = `

uniform sampler2D positions;
uniform float uTime;
uniform float uFrequency;

varying vec2 vUv;

${glslCurlNoise}

void main() {
    // 1. Read the current position of the particle
    vec3 pos = texture2D(positions, vUv).rgb;

    // 2. Calculate the flow direction (Curl Noise) at this position
    // We multiply by frequency to control the "zoom" of the noise
    vec3 noise = curlNoise(pos * uFrequency + uTime * 0.1);

    // 3. Add the noise to the current position to move it
    // IMPORTANT: The multiplier (0.005) is the speed. 
    // Keep this very small so the model doesn't melt away instantly.
    vec3 newPos = pos + (noise * 0.005);

    gl_FragColor = vec4(newPos, 1.0);
}
`

export default fragmentShader