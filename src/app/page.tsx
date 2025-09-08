"use client";

import Header from "@/components/Header";
import useWindowWidth from "@/hooks/useWindowWidth";
import { formatPrice } from "@/lib/format";
import { Filter } from "bad-words";
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

const convertToTitleCase = (name: string) => {
	return name
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.map((word) => `${word[0].toUpperCase()}${word.slice(1).toLowerCase()}`)
		.join(" ");
};

const filter = new Filter();

const getLuminance = ({ red, green, blue }: Color) => {
	const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;

	return luminance > 0.5 ? "black" : "white";
};

const isMoreThanThreeWords = (input: string) => {
	const words = input.trim().split(/\s+/).filter(Boolean);

	return words.length > 3;
};

const validCharacters = /^[a-zA-Z '\-]+$/;

const isValidName = (name: string) => {
	name = name.trim();

	return (
		!!name.length &&
		validCharacters.test(name) &&
		!isMoreThanThreeWords(name) &&
		name.length <= 25 &&
		!filter.isProfane(name)
	);
};

const Home = () => {
	const [customName, setCustomName] = useState("");
	const [hasName, setHasName] = useState(false);
	const [hasNameBeenSelected, setHasNameBeenSelected] = useState(false);
	const [isAssigningName, setIsAssigningName] = useState(false);
	const [isRetrievingNames, setIsRetrievingNames] = useState(false);
	const [message, setMessage] = useState("");
	const [minimumPrice, setMinimumPrice] = useState(0);
	const [price, setPrice] = useState(0);
	const [priceInput, setPriceInput] = useState("");
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

	const width = useWindowWidth();

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
						`${
							width >= 1024 ? "This color" : `#${localHex}`
						} hasn't been named yet! Here are some suggestions:`
					);

					setIsRetrievingNames(true);

					try {
						const suggestionsResponse = await fetch("/api/names", {
							method: "POST",
							headers: {
								"Content-Type": "application/json"
							},
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

				setMinimumPrice(data.price);
				setPrice(data.price);
			} catch (error) {
				setMessage("AI error");
				console.error(error);
			}
		};

		setColor();
	}, []);

	useEffect(() => {
		setMessage(
			`${
				width >= 1024 ? "This color" : `#${hex}`
			} hasn't been named yet! Here are some suggestions:`
		);
	}, [hex, width]);

	const handleNameSelection = async (suggestion: string) => {
		suggestion = convertToTitleCase(suggestion);

		setIsAssigningName(true);

		try {
			const response = await fetch("/api/checkout", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					color,
					hex,
					name: suggestion,
					price
				})
			});
			const data = await response.json();

			if (response.ok && data.url) {
				window.location.href = data.url;
			} else {
				console.error(data);
				setMessage("Checkout error");
			}
		} catch (error) {
		} finally {
			setIsAssigningName(false);
		}
	};

	const onNameChange = (input: string) => {
		setCustomName(input);
	};

	return (
		<div
			className={`gap-2 grid grid-cols-2 grid-rows-5 h-screen w-screen p-4`}
			style={{
				backgroundColor: `#${hex}`
			}}
		>
			<Header color={color} />
			<div
				className="border col-span-1 hidden lg:flex items-center justify-center row-span-4 rounded-lg"
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
				className="border col-span-2 lg:col-span-1 flex flex-col items-center justify-around p-2 row-span-4 rounded-lg"
				style={{ borderColor: color }}
			>
				<p
					className="text-center text-xl w-4/5"
					style={{
						color
					}}
				>
					{message}
				</p>
				{!hasName && (
					<>
						<div className="flex gap-2 h-12 w-full">
							{!suggestions.length ? (
								Array.from({ length: 3 }).map((_, index) => {
									return (
										<div
											className={`${
												isRetrievingNames &&
												"animate-pulse"
											} flex-1 h-full rounded-lg`}
											key={index}
											style={{
												backgroundColor: color
											}}
										/>
									);
								})
							) : (
								<div className="gap-2 grid grid-cols-3 w-full">
									{suggestions.map((suggestion, index) => (
										<button
											className="cursor-pointer col-span-1 h-full min-h-12 hover:opacity-75 rounded-lg text-sm"
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
					</>
				)}
				{!hasNameBeenSelected && (
					<>
						<p style={{ color }}>- OR -</p>
						<div className="flex gap-2 items-center justify-center w-full">
							<div className="flex flex-col flex-1 gap-2 ">
								<input
									aria-label="Custom color name"
									className="min-h-12 pl-2 rounded-lg w-full"
									onChange={(e) =>
										onNameChange(e.target.value)
									}
									placeholder="Enter color name"
									style={{
										backgroundColor: color,
										color: `#${hex}`
									}}
									type="text"
									value={customName}
								/>
								<input
									aria-label="Your bid in dollars"
									className="min-h-12 pl-2 rounded-lg w-full"
									inputMode="decimal"
									onChange={(e) => {
										const v = e.target.value;

										const cleaned = Number(
											v.replace(/\D/g, "")
										);

										setPrice(cleaned);
										setPriceInput(
											cleaned ? formatPrice(cleaned) : ""
										);
									}}
									placeholder={`Minimum price: $${formatPrice(
										minimumPrice + 100
									)}`}
									style={{
										backgroundColor: color,
										color: `#${hex}`
									}}
									value={priceInput}
								/>
							</div>
							<button
								aria-label="Submit your color name and bid"
								className={`${
									isValidName(customName) &&
									!isAssigningName &&
									price >= minimumPrice + 100 &&
									"cursor-pointer hover:opacity-75"
								} h-full min-h-12 px-2 py-1 rounded-lg`}
								disabled={
									!isValidName(customName) ||
									isAssigningName ||
									price < minimumPrice + 100
								}
								onClick={() => handleNameSelection(customName)}
								style={{
									backgroundColor: color,
									color: `#${hex}`
								}}
							>
								Submit
							</button>
						</div>
						<div
							className="flex flex-col items-center text-center"
							style={{ color }}
						>
							<p>CUSTOM NAME RULES</p>
							<ul className="gap-2 grid grid-cols-5 pl-4">
								<li className="contents">
									<span className="col-span-4 text-left">
										Cannot be more than three words
									</span>
									<span>
										{isMoreThanThreeWords(customName)
											? "❌"
											: "✅"}
									</span>
								</li>
								<li className="contents">
									<span className="col-span-4 text-left">
										Only letters, apostrophes, spaces, and
										hyphens allowed
									</span>
									<span>
										{!validCharacters.test(customName)
											? "❌"
											: "✅"}
									</span>
								</li>
								<li className="contents">
									<span className="col-span-4 text-left">
										No longer than 25 characters
									</span>
									<span>
										{customName.length > 25 ? "❌" : "✅"}
									</span>
								</li>
								<li className="contents">
									<span className="col-span-4 text-left">
										Watch your profanity
									</span>
									<span>
										{filter.isProfane(customName)
											? "❌"
											: "✅"}
									</span>
								</li>
								<li className="contents">
									<span className="col-span-4 text-left">
										Must be at least $1 more than the last
										bid
									</span>
									<span>
										{price >= minimumPrice + 100
											? "✅"
											: "❌"}
									</span>
								</li>
							</ul>
						</div>
					</>
				)}
			</div>
		</div>
	);
};

export default Home;
