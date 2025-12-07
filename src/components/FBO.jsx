import { Canvas, useFrame, extend, createPortal } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { useMemo, useRef, useState, useEffect, Suspense } from "react";
import * as THREE from "three";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler";

import SimulationMaterial from "../animations/SimulationMaterial";
import vertexShader from "../animations/vertexShader";
import fragmentShader from "../animations/fragmentShader";

extend({ SimulationMaterial });

// Helper function to sample points from a mesh
const getModelData = (mesh, size) => {
    const length = size * size * 4;
    const data = new Float32Array(length);
    
    // Create a sampler
    const sampler = new MeshSurfaceSampler(mesh).build();
    const tempPosition = new THREE.Vector3();

    for (let i = 0; i < length; i++) {
        const stride = i * 4;
        
        // Sample a random point on the surface
        sampler.sample(tempPosition);

        data[stride] = tempPosition.x;
        data[stride + 1] = tempPosition.y;
        data[stride + 2] = tempPosition.z;
        data[stride + 3] = 1.0; 
    }
    return data;
};

const RotatingScene = ({ children }) => {
    const groupRef = useRef(null);

    useFrame((state) => {
        const { pointer } = state;
        const targetRotationX = -pointer.y * 0.5; //reduced rotation speed
        const targetRotationY = pointer.x * 0.5;
        if (groupRef.current) {
            groupRef.current.rotation.x = THREE.MathUtils.lerp(
                groupRef.current.rotation.x, targetRotationX, 0.05
            );
            groupRef.current.rotation.y = THREE.MathUtils.lerp(
                groupRef.current.rotation.y, targetRotationY, 0.05
            );
        }
    });
    return <group ref={groupRef}>{children}</group>;
};

const FBOParticles = () => {
    const size = 256; 
    const { scene: modelScene } = useGLTF("/public/pioneer_dj_console.glb"); 

    const points = useRef(null);
    const simulationMaterialRef = useRef(null);

    // 2. Extract the data from the model
    const data = useMemo(() => {
        let mesh = null;
        
        // Traverse the GLB to find the first Mesh
        modelScene.traverse((child) => {
            if (child.isMesh && !mesh) {
                mesh = child;
            }
        });

        if (!mesh) return new Float32Array(size * size * 4);
        
        return getModelData(mesh, size);
    }, [modelScene, size]);

    const scene = useMemo(() => new THREE.Scene(), []);
    const camera = useMemo(
        () => new THREE.OrthographicCamera(-1, 1, 1, -1, 1 / Math.pow(2, 53), 1),
        []
    );

    const positions = useMemo(
        () => new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0]),
        []
    );
    const uvs = useMemo(
        () => new Float32Array([0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0]),
        []
    );

    const renderTarget = useMemo(() => {
        return new THREE.WebGLRenderTarget(size, size, {
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            format: THREE.RGBAFormat,
            stencilBuffer: false,
            type: THREE.FloatType,
        });
    }, [size]);

    const particlesPosition = useMemo(() => {
        const length = size * size;
        const particles = new Float32Array(length * 3);
        for (let i = 0; i < length; i++) {
            const i3 = i * 3;
            particles[i3 + 0] = (i % size) / size;
            particles[i3 + 1] = i / size / size;
        }
        return particles;
    }, [size]);

    const uniforms = useMemo(() => ({
        uPositions: { value: null }
    }), []);

    useFrame((state) => {
        const { gl, clock, pointer } = state;

        if (simulationMaterialRef.current) {
            simulationMaterialRef.current.uniforms.uMouse.value.lerp(pointer, 0.1);
            simulationMaterialRef.current.uniforms.uTime.value = clock.elapsedTime;
        }

        gl.setRenderTarget(renderTarget);
        gl.clear();
        gl.render(scene, camera);
        gl.setRenderTarget(null);

        if (points.current) {
            points.current.material.uniforms.uPositions.value = renderTarget.texture;
        }
    });

    return (
        <>
            {createPortal(
                <mesh>
                    <simulationMaterial 
                        ref={simulationMaterialRef} 
                        args={[size, data]} 
                    />
                    <bufferGeometry>
                        <bufferAttribute
                            attach="attributes-position"
                            args={[positions, 3]}
                            count={positions.length / 3}
                        />
                        <bufferAttribute
                            attach="attributes-uv"
                            args={[uvs, 2]}
                            count={uvs.length / 2}
                        />
                    </bufferGeometry>
                </mesh>,
                scene
            )}
            
            {/* ROTATION APPLIED HERE */}
            {/* [X, Y, Z] -> X flips it upright, Y rotates it diagonally */}
            <points ref={points} rotation={[Math.PI, Math.PI / 4, 0]}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        args={[particlesPosition, 3]}
                        count={particlesPosition.length / 3}
                    />
                </bufferGeometry>
                <shaderMaterial
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                    fragmentShader={fragmentShader}
                    vertexShader={vertexShader}
                    uniforms={uniforms}
                />
            </points>
        </>
    );
};

const FboAnimation = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => { setIsMobile(window.innerWidth < 768); };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    return (
        <Canvas
            camera={{ position: [-60, -25, 85] }}
            style={{ background: "black", width: "100%", height: "100%" }}
            dpr={[1, 2]}
        >
            <ambientLight intensity={0.5} />
            
            <Suspense fallback={null}>
                <RotatingScene>
                    <FBOParticles />
                </RotatingScene>
            </Suspense>

            {!isMobile && <OrbitControls enableZoom={false} enablePan={false} />}
        </Canvas>
    );
};

export default FboAnimation;