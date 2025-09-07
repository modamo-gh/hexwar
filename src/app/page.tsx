"use client";

import { Press_Start_2P } from "next/font/google";
import { useEffect, useMemo, useState } from "react";

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

const pressStart2P = Press_Start_2P({
	subsets: ["latin"],
	weight: "400",
	display: "swap",
	variable: "--font-press-start"
});

const Home = () => {
	const [hasName, setHasName] = useState(false);
	const [isAssigningName, setIsAssigningName] = useState(false);
	const [isRetrievingNames, setIsRetrievingNames] = useState(false);
	const [message, setMessage] = useState("");
	const [rgb, setRGB] = useState<Color>({
		red: 0,
		green: 0,
		blue: 0
	});
	const [suggestions, setSuggestions] = useState<string[]>([]);

	const hex = useMemo(() => {
		return convertRGBToHex(rgb);
	}, [rgb]);
	const color = useMemo(() => {
		return getLuminance(rgb);
	}, [rgb]);

	useEffect(() => {
		const setColor = async () => {
			const red = Math.floor(Math.random() * 256);
			const green = Math.floor(Math.random() * 256);
			const blue = Math.floor(Math.random() * 256);
			const color = { red, green, blue };

			setRGB(color);

			const localHex = convertRGBToHex(color);

			try {
				const response = await fetch(`/api/colors?hex=${localHex}`, {
					method: "GET"
				});

				const data = await response.json();

				setHasName(!!data.name);

				if (!data.name) {
					setMessage(
						"This color hasn't been named yet! Here are some suggestions:"
					);

					setIsRetrievingNames(true);

					try {
						const suggestionsResponse = await fetch("/api/names", {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({
								hex: localHex
							})
						});

						const suggestionsData =
							await suggestionsResponse.json();

						setSuggestions(suggestionsData.suggestions);
					} catch (error) {
					} finally {
						setIsRetrievingNames(false);
					}
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

	const handleNameSelection = async (suggestion: string) => {
		setIsAssigningName(true);

		try {
			const response = await fetch("/api/colors", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ hex, name: suggestion })
			});

			if (response.ok) {
				setHasName(true);
				setMessage(`#${hex} is now named ${suggestion}!`);
				setSuggestions([]);
			}
		} catch (error) {
		} finally {
			setIsAssigningName(false);
		}
	};

	return (
		<div
			className={`gap-2 grid grid-cols-2 grid-rows-5 h-screen w-screen p-4 ${pressStart2P.className}`}
			style={{
				backgroundColor: `#${hex}`
			}}
		>
			<div
				className="border flex col-span-2 items-center justify-center row-span-1 rounded"
				style={{ borderColor: color }}
			>
				<h1
					className="text-5xl tracking-widest"
					style={{
						color
					}}
				>
					#HEXWAR
				</h1>
			</div>
			<div
				className="border col-span-1 flex items-center justify-center row-span-4 rounded"
				style={{ borderColor: color }}
			>
				<p
					className="text-5xl"
					style={{
						color
					}}
				>
					#{hex ?? "000000"}
				</p>
			</div>
			<div
				className="border col-span-1 flex flex-col gap-12 items-center justify-center p-2 row-span-4 rounded"
				style={{ borderColor: color }}
			>
				<p
					className="text-center text-2xl w-4/5"
					style={{
						color
					}}
				>
					{message}
				</p>
				{!hasName && (
					<div className="flex gap-2 h-12 items-center justify-around w-full">
						{!suggestions.length
							? Array.from({ length: 3 }).map((_, index) => {
									return (
										<div
											className={`${
												isRetrievingNames &&
												"animate-pulse"
											} h-12 rounded w-16`}
											key={index}
											style={{
												backgroundColor: color
											}}
										/>
									);
							  })
							: suggestions.map((suggestion, index) => (
									<button
										className="cursor-pointer flex-1 h-full hover:opacity-75 rounded"
										disabled={isAssigningName}
										key={index}
										onClick={() =>
											handleNameSelection(suggestion)
										}
										style={{
											backgroundColor: color,
											color: `#${hex}`
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
