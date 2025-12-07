import glslCurlNoise from './glslCurlNoise.js';

const fragmentShader = `

uniform sampler2D positions;
uniform float uTime;
uniform float uFrequency;
uniform vec2 uMouse;

varying vec2 vUv;

${glslCurlNoise}

void main() {
    // --- SETTINGS ---
    float wiggleSpeed = 0.1;      // How fast they wiggle
    float wiggleAmp = 0.3;       // How far they wiggle (Try 0.1 if too subtle)
    float mouseRadius = 0.6;      // How big the mouse push is
    float mouseStrength = 0.6;    // How hard the mouse pushes
    float viewScale = 4.0;        // Multiplier to match mouse to world size
    // ----------------
    
    // 1. Get current position
    vec3 pos = texture2D(positions, vUv).rgb;

    // 2. Wiggle Effect
    // We mix the static position with the noise so they don't fly away
    vec3 noise = curlNoise(pos * uFrequency + uTime * wiggleSpeed);
    vec3 targetPos = pos + (noise * wiggleAmp);

    // 3. Mouse Interaction
    // Scale the mouse from Screen Space (-1 to 1) to World Space
    vec2 mouseWorld = uMouse * viewScale;
    
    // Flip X because your model is rotated 180 degrees
    vec3 mousePos = vec3(-mouseWorld.x, mouseWorld.y, 0.0);
    
    // Calculate distance (ignoring Z depth)
    float dist = distance(targetPos.xy, mousePos.xy);
    
    vec3 finalPos = targetPos;

    if (dist < mouseRadius) {
        // Push away from mouse
        vec3 repulseDir = normalize(targetPos - mousePos);
        float force = 1.0 - (dist / mouseRadius); // Stronger in center
        finalPos += repulseDir * force * mouseStrength;
    }

    gl_FragColor = vec4(finalPos, 1.0);
}
`

export default fragmentShader;


