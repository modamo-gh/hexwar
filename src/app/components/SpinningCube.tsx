import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const SpinningCube = () => {
	const geometry = useMemo(() => {
		const boxGeometry = new THREE.BoxGeometry(1.8, 1.8, 1.8);
		const colors = [];
		const position = boxGeometry.attributes.position;

		for (let i = 0; i < position.count; i++) {
			const x = position.getX(i);
			const y = position.getY(i);
			const z = position.getZ(i);

			const red = (x + 0.9) / 1.8;
			const green = (y + 0.9) / 1.8;
			const blue = (z + 0.9) / 1.8;

			colors.push(red, green, blue);
		}

		boxGeometry.setAttribute(
			"color",
			new THREE.Float32BufferAttribute(colors, 3)
		);

		return boxGeometry;
	}, []);
	const ref = useRef<THREE.Mesh>(null!);

	useFrame((_, delta) => {
		ref.current.rotation.x += delta * 0.125;
		ref.current.rotation.y += delta * 0.125;
	});

	return (
		<mesh geometry={geometry} ref={ref}>
			<meshStandardMaterial
				metalness={0.1}
				roughness={0.5}
                vertexColors
			/>
		</mesh>
	);
};

export default SpinningCube;
