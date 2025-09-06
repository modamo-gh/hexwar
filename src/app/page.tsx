"use client";

import { Canvas } from "@react-three/fiber";
import { Press_Start_2P } from "next/font/google";
import { useEffect, useState } from "react";
import SpinningCube from "./components/SpinningCube";

const pressStart2P = Press_Start_2P({
	subsets: ["latin"],
	weight: "400",
	display: "swap",
	variable: "--font-press-start"
});

const Home = () => {
	const [rgb, setRGB] = useState<string>();

	useEffect(() => {
		setRGB(
			`#${Math.floor(Math.random() * 256)
				.toString(16)
				.padStart(2, "0")
				.toUpperCase()}${Math.floor(Math.random() * 256)
				.toString(16)
				.padStart(2, "0")
				.toUpperCase()}${Math.floor(Math.random() * 256)
				.toString(16)
				.padStart(2, "0")
				.toUpperCase()}`
		);
	}, []);

	return (
		<div
			className="flex flex-col h-screen w-screen items-center justify-center p-4"
			style={{ backgroundColor: rgb }}
		>
			<div className="flex-1">
				<h1
					className={`${pressStart2P.className} text-white text-5xl tracking-widest`}
				>
					#HEXWAR
				</h1>
			</div>
			<Canvas
				camera={{ fov: 45, position: [3.5, 3.5, 3.5] }}
				className="flex-9"
			>
				<ambientLight intensity={0.6}/>
				<directionalLight intensity={0.8} position={[3, 5, 2]} />
				<SpinningCube />
			</Canvas>
		</div>
	);
};

export default Home;
