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

const getLuminance = ({ red, green, blue }: Color) => {
	const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;

	return luminance > 0.5 ? "black" : "white";
};

const handleNameSelection = async (color: Color, suggestion: string) => {
	try {
		const response = await fetch(
			`/api/colors?hex=${convertRGBToHex(color)}`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: suggestion })
			}
		);

		console.log(response);
	} catch (error) {}
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
				const response = await fetch(
					`/api/colors?hex=${convertRGBToHex(color)}`,
					{
						method: "GET"
					}
				);

				const data = await response.json();

				if (!data.name) {
					setMessage(
						"This color hasn't been named yet! Here are some suggestions:"
					);

					try {
						const suggestionsResponse = await fetch("/api/names", {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({
								hex: convertRGBToHex(color)
							})
						});

						const suggestionsData =
							await suggestionsResponse.json();

						setSuggestions(suggestionsData.suggestions);
					} catch (error) {}
				} else {
					setMessage(`The name of this color is ${data.name}`);
				}
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
						color: getLuminance(rgb)
					}}
				>
					#HEXWAR
				</h1>
			</div>
			<div className="flex flex-col flex-4 items-center justify-around">
				<p
					className="text-5xl"
					style={{
						color: getLuminance(rgb)
					}}
				>
					#{convertRGBToHex(rgb) ?? "000000"}
				</p>
				<p
					className="text-center text-2xl w-4/5"
					style={{
						color: getLuminance(rgb)
					}}
				>
					{message}
				</p>
				{suggestions.length > 0 && (
					<div className="flex items-center justify-around w-4/5">
						{suggestions.map((suggestion, index) => (
							<button
								className="cursor-pointer hover:opacity-75 px-4 py-2 rounded"
								key={index}
								onClick={() =>
									handleNameSelection(rgb, suggestion)
								}
								style={{
									backgroundColor: getLuminance(rgb),
									color: `#${convertRGBToHex(rgb)}`
								}}
							>
								{suggestion}
							</button>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default Home;
