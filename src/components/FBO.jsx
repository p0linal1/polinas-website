import { Canvas, useFrame, extend, createPortal } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";

import SimulationMaterial from "../animations/SimulationMaterial";
import vertexShader from "../animations/vertexShader";
import fragmentShader from "../animations/fragmentShader";

// Extend R3F to recognize SimulationMaterial
extend({ SimulationMaterial });

// This component creates a group that rotates to follow the mouse
const RotatingScene = ({ children }) => {
    const groupRef = useRef(null);

    useFrame((state) => {
        const { pointer } = state;
        // Rotate the group based on mouse position
        const targetRotationX = pointer.y * 1.8;
        const targetRotationY = -pointer.x * 1.8;
        if (groupRef.current) {
            groupRef.current.rotation.x = THREE.MathUtils.lerp(
                groupRef.current.rotation.x,
                targetRotationX,
                0.05
            );
            groupRef.current.rotation.y = THREE.MathUtils.lerp(
                groupRef.current.rotation.y,
                targetRotationY,
                0.05
            );
        }
    });

    return <group ref={groupRef}>{children}</group>;
};

const FBOParticles = () => {
    const size = 138;

    const points = useRef(null);
    const simulationMaterialRef = useRef(null);

    const scene = useMemo(() => new THREE.Scene(), []);
    const camera = useMemo(
        () => new THREE.OrthographicCamera(-1, 1, 1, -1, 1 / Math.pow(2, 53), 1),
        []
    );

    const positions = useMemo(
        () =>
            new Float32Array([
                -1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0,
            ]),
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

    const uniforms = useMemo(
        () => ({
            uPositions: {
                value: null,
            },
        }),
        []
    );

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
                    <simulationMaterial ref={simulationMaterialRef} args={[size]} />
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
            <points ref={points}>
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
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);

        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    return (
        <Canvas
            camera={{ position: [0, 0, 1.4] }}
            style={{ background: "black", width: "100%", height: "100%" }}
            dpr={[1, 2]}
        >
            <ambientLight intensity={0.5} />
            <RotatingScene>
                <FBOParticles />
            </RotatingScene>
            {!isMobile && <OrbitControls enableZoom={false} enablePan={false} />}
        </Canvas>
    );
};

export default FboAnimation;