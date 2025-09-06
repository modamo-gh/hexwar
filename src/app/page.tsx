"use client";

import { Press_Start_2P } from "next/font/google";
import { useEffect, useState } from "react";

type Color = {
	red: number;
	green: number;
	blue: number;
};

const convertColorObjectToHex = (color: Color) => {
	return `${color.red
		.toString(16)
		.padStart(2, "0")
		.toUpperCase()}${color.green
		.toString(16)
		.padStart(2, "0")
		.toUpperCase()}${color.blue
		.toString(16)
		.padStart(2, "0")
		.toUpperCase()}`;
};

const getBlackOrWhite = (color: Color) => {
	const blackCount =
		(color.red < 128 ? 1 : 0) +
		(color.green < 128 ? 1 : 0) +
		(color.blue < 128 ? 1 : 0);

	return blackCount;
};

const pressStart2P = Press_Start_2P({
	subsets: ["latin"],
	weight: "400",
	display: "swap",
	variable: "--font-press-start"
});

const Home = () => {
	const [hexColor, setHexColor] = useState<Color>({
		red: 0,
		green: 0,
		blue: 0
	});

	useEffect(() => {
		const setColor = async () => {
			const red = Math.floor(Math.random() * 256);
			const green = Math.floor(Math.random() * 256);
			const blue = Math.floor(Math.random() * 256);
			const color = { red, green, blue };

			setHexColor(color);

			await fetch(`/api/colors?hex=${convertColorObjectToHex(color)}`);
		};

		setColor();
	}, []);

	return (
		<div
			className={`flex flex-col h-screen w-screen items-center justify-center p-4 ${pressStart2P.className}`}
			style={{
				backgroundColor: `#${convertColorObjectToHex(hexColor)}`
			}}
		>
			<div className="flex flex-1 items-center">
				<h1
					className="text-5xl tracking-widest"
					style={{
						color: getBlackOrWhite(hexColor) < 2 ? "black" : "white"
					}}
				>
					#HEXWAR
				</h1>
			</div>
			<div className="flex flex-4 items-center">
				<p
					className="text-5xl"
					style={{
						color: getBlackOrWhite(hexColor) < 2 ? "black" : "white"
					}}
				>
					#{convertColorObjectToHex(hexColor) ?? "000000"}
				</p>
			</div>
		</div>
	);
};

export default Home;
