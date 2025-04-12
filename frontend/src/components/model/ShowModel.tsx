"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, Grid, PerspectiveCamera } from "@react-three/drei";
import { Suspense } from "react";
import { useProgress, Html } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { useRef } from "react";
import { Group } from "three";

type ShowModelProps = {
    modelUrl?: string; // Optional prop
    envMapUrl?: string; // Optional prop
};

function Loader() {
    const { progress } = useProgress();
    return <Html center>{progress.toFixed(1)} % loaded</Html>;
}

// Subcomponent to render the model, only called when modelUrl is valid
function ModelRenderer({ modelUrl, envMapUrl }: { modelUrl: string; envMapUrl?: string }) {
    const group = useRef<Group>(null);
    const { scene } = useGLTF(modelUrl); // useGLTF is called unconditionally

    return (
        <>
            <Suspense fallback={<Loader />}>
                {envMapUrl && (
                    <Environment
                        files={envMapUrl}
                        background
                        backgroundBlurriness={0.5}
                    />
                )}
                <Grid
                    cellSize={3}
                    cellThickness={0.4}
                    cellColor="#808080"
                    sectionSize={5}
                    sectionThickness={0.2}
                    sectionColor="#808080"
                    followCamera={true}
                    infiniteGrid={true}
                />
                <group ref={group}>
                    <primitive object={scene} />
                    <OrbitControls
                        inertiaFactor={0.07}
                        distanceMin={5}
                        distanceMax={15}
                        maxPolarAngle={Math.PI / 2}
                        minPolarAngle={0}
                        target={[0, 0, 0]}
                    />
                </group>
                <EffectComposer>
                    <Bloom intensity={0.2} />
                </EffectComposer>
                <PerspectiveCamera makeDefault position={[20, 5, 20]} fov={10} />
            </Suspense>
        </>
    );
}

export default function ShowModel({ modelUrl, envMapUrl }: ShowModelProps) {
    // If modelUrl is invalid, render a fallback UI
    if (!modelUrl) {
        return (
            <Canvas gl={{ antialias: true }} dpr={[1, 1.5]} className="relative">
                <Html center>
                    <div>Ошибка: Не удалось загрузить модель</div>
                </Html>
            </Canvas>
        );
    }

    return (
        <Canvas gl={{ antialias: true }} dpr={[1, 1.5]} className="relative h-svh">
            <directionalLight position={[45, 45, 45]} color="orange" />
            <ModelRenderer modelUrl={modelUrl} envMapUrl={envMapUrl} />
        </Canvas>
    );
}