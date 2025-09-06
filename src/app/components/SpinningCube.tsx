import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

const SpinningCube = () => {
	const ref = useRef<THREE.Mesh>(null!);

	useFrame((_, delta) => {
		ref.current.rotation.x += delta * 0.125;
		ref.current.rotation.y += delta * 0.125;
	});

	return (
		<mesh ref={ref}>
			<boxGeometry args={[1.8, 1.8, 1.8]} />
			<meshStandardMaterial
				color={"red"}
				metalness={0.1}
				roughness={0.5}
			/>
		</mesh>
	);
};

export default SpinningCube;
