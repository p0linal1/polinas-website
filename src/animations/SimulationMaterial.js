import simulationVertexShader from './simulationVertexShader';
import simulationFragmentShader from './simulationFragmentShader';
import * as THREE from "three";

class SimulationMaterial extends THREE.ShaderMaterial {
    constructor(size, data) {
        // Create the texture from the data passed in (from the GLB)
        const positionsTexture = new THREE.DataTexture(
            data,
            size,
            size,
            THREE.RGBAFormat,
            THREE.FloatType
        );
        positionsTexture.needsUpdate = true;

        const simulationUniforms = {
            positions: { value: positionsTexture },
            uFrequency: { value: 0.01}, // Lower this to keep shape intact
            uTime: { value: 0 },
            uMouse: { value: new THREE.Vector2(0, 0) },
        };

        super({
            uniforms: simulationUniforms,
            vertexShader: simulationVertexShader,
            fragmentShader: simulationFragmentShader,
        });
    }
}

export default SimulationMaterial;