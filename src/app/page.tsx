"use client";

import { Press_Start_2P } from "next/font/google";
import { useEffect, useState } from "react";

type Color = {
	red: number;
	green: number;
	blue: number;
};

const convertRGBToHex = (color: Color) => {
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
	const [message, setMessage] = useState("");
	const [rgb, setRGB] = useState<Color>({
		red: 0,
		green: 0,
		blue: 0
	});
	const [suggestions, setSuggestions] = useState<string[]>([]);

	useEffect(() => {
		const setColor = async () => {
			const red = Math.floor(Math.random() * 256);
			const green = Math.floor(Math.random() * 256);
			const blue = Math.floor(Math.random() * 256);
			const color = { red, green, blue };

			setRGB(color);

			try {
				const response = await fetch(`/api/names`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ hex: `#${convertRGBToHex(color)}` })
				});

				const data = await response.json();

				setSuggestions(data.suggestions);
			} catch (error) {
				setMessage("AI error");
				console.error(error);
			}
		};

		setColor();
	}, []);

	return (
		<div
			className={`flex flex-col h-screen w-screen items-center justify-center p-4 ${pressStart2P.className}`}
			style={{
				backgroundColor: `#${convertRGBToHex(rgb)}`
			}}
		>
			<div className="flex flex-1 items-center">
				<h1
					className="text-5xl tracking-widest"
					style={{
						color: getBlackOrWhite(rgb) < 2 ? "black" : "white"
					}}
				>
					#HEXWAR
				</h1>
			</div>
			<div className="flex flex-col flex-4 items-center justify-center">
				<p
					className="text-5xl"
					style={{
						color: getBlackOrWhite(rgb) < 2 ? "black" : "white"
					}}
				>
					#{convertRGBToHex(rgb) ?? "000000"}
				</p>
				{suggestions.length && (
					<p
						className="text-2xl"
						style={{
							color: getBlackOrWhite(rgb) < 2 ? "black" : "white"
						}}
					>
						{
							"This color hasn't been named yet! Here are some suggestions:"
						}
					</p>
				)}
				<div className="flex items-center justify-around w-4/5">
					{suggestions.map((suggestion, index) => (
						<p key={index}>{suggestion}</p>
					))}
				</div>
			</div>
		</div>
	);
};

export default Home;
