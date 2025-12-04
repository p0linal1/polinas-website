// import simulationVertexShader from './simulationVertexShader';
// import simulationFragmentShader from './simulationFragmentShader';
// import * as THREE from "three";
// import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler";

// const getRandomData = (width, height) => {
//     // we need to create a vec4 since we're passing the positions to the fragment shader
//     // data textures need to have 4 components, R, G, B, and A
//     const length = width * height * 4;
//     const data = new Float32Array(length);

//     for (let i = 0; i < length; i++) {
//         const stride = i * 4;

//         const distance = Math.sqrt(Math.random()) * 2.0;
//         const theta = THREE.MathUtils.randFloatSpread(360);
//         const phi = THREE.MathUtils.randFloatSpread(360);

//         data[stride] = distance * Math.sin(theta) * Math.cos(phi);
//         data[stride + 1] = distance * Math.sin(theta) * Math.sin(phi);
//         data[stride + 2] = distance * Math.cos(theta);
//         data[stride + 3] = 1.0; // this value will not have any impact
//     }

//     return data;
// };

// class SimulationMaterial extends THREE.ShaderMaterial {
//     constructor(size) {
//         const positionsTexture = new THREE.DataTexture(
//             getRandomData(size, size),
//             size,
//             size,
//             THREE.RGBAFormat,
//             THREE.FloatType
//         );
//         positionsTexture.needsUpdate = true;

//         const simulationUniforms = {
//             positions: { value: positionsTexture },
//             uFrequency: { value: 0.25 },
//             uTime: { value: 0 },
//             uMouse: { value: new THREE.Vector2(0, 0) },
//         };

//         super({
//             uniforms: simulationUniforms,
//             vertexShader: simulationVertexShader,
//             fragmentShader: simulationFragmentShader,
//         });
//     }
// }

// export default SimulationMaterial;





// const geometry = new THREE.TorusKnotGeometry(1, 0.4, 100, 16);
// const material = new THREE.MeshBasicMaterial();
// const mesh = new THREE.Mesh(geometry, material);


// const getShapeData = (width, height) => {
//     const length = width * height * 4;
//     const data = new Float32Array(length);
    
//     // Create a sampler for the mesh
//     const sampler = new MeshSurfaceSampler(mesh).build();
//     const tempPosition = new THREE.Vector3();

//     for (let i = 0; i < length; i++) {
//         const stride = i * 4;
        
//         // Sample a random point on the surface of the geometry
//         sampler.sample(tempPosition);

//         data[stride] = tempPosition.x;
//         data[stride + 1] = tempPosition.y;
//         data[stride + 2] = tempPosition.z;
//         data[stride + 3] = 1.0;
//     }

//     return data;
// };

// class SimulationMaterial extends THREE.ShaderMaterial {
//     constructor(size) {
//         const positionsTexture = new THREE.DataTexture(
//             getShapeData(size, size), // Use the new function here
//             size,
//             size,
//             THREE.RGBAFormat,
//             THREE.FloatType
//         );
//         positionsTexture.needsUpdate = true;
        
//         // ... keep the rest of your constructor the same
//         const simulationUniforms = {
//             positions: { value: positionsTexture },
//             uFrequency: { value: 0.25 },
//             uTime: { value: 0 },
//             uMouse: { value: new THREE.Vector2(0, 0) },
//         };

//         super({
//             uniforms: simulationUniforms,
//             vertexShader: simulationVertexShader,
//             fragmentShader: simulationFragmentShader,
//         });
//     }
// }

// export default SimulationMaterial;


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