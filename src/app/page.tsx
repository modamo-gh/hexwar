"use client";

import Header from "@/components/Header";
import useWindowWidth from "@/hooks/useWindowWidth";
import { formatPrice } from "@/lib/format";
import { Filter } from "bad-words";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

type Color = {
	red: number;
	green: number;
	blue: number;
};

const convertHexToRGB = (hex: string) => {
	const color: Color = { red: 0, green: 0, blue: 0 };

	color.red = Number(`0x${hex.slice(0, 2)}`);
	color.green = Number(`0x${hex.slice(2, 4)}`);
	color.blue = Number(`0x${hex.slice(4, 6)}`);

	return color;
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
	const hexInputs = useRef<HTMLInputElement[]>(Array.from({ length: 6 }));

	const [customName, setCustomName] = useState("");
	const [hasName, setHasName] = useState(false);
	const [hasNameBeenSelected, setHasNameBeenSelected] = useState(false);
	const [hexDigits, setHexDigits] = useState<string[]>(
		Array.from<string>({ length: 6 }).fill("")
	);
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

	const setColor = async (c?: string) => {
		let localHex;

		if (!c) {
			const red = Math.floor(Math.random() * 256);
			const green = Math.floor(Math.random() * 256);
			const blue = Math.floor(Math.random() * 256);
			const color = { red, green, blue };

			setRGB(color);

			localHex = convertRGBToHex(color);
		} else {
			localHex = c;

			setRGB(convertHexToRGB(c));
		}

		setHasName(false);
		setSuggestions([]);
		setMessage("");

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

					const suggestionsData = await suggestionsResponse.json();

					setSuggestions(suggestionsData.suggestions);
				} catch {
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

	useEffect(() => {
		setColor();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		setMessage(
			`${
				width >= 1024 ? "This color" : `#${hex}`
			} hasn't been named yet! Here are some suggestions:`
		);
	}, [hex, width]);

	const handleColorSearch = async (c: string) => {
		setColor(c);
	};

	const handleHexInput = (digit: string, index: number) => {
		if (/[a-fA-F0-9]/.test(digit)) {
			const hd = [...hexDigits];

			hd[index] = digit.toUpperCase();

			setHexDigits(hd);

			if (index < 5) {
				hexInputs.current[index + 1]?.focus();
			}
		} else if (!/[a-fA-F0-9]/.test(digit) && index < 5) {
			hexInputs.current[index].value = "";
		}
	};

	const handleKeyNavigation = (e: KeyboardEvent, index: number) => {
		if (e.key === "Backspace") {
			e.preventDefault();

			const hd = [...hexDigits];

			hd[index] = "";

			setHexDigits(hd);

			if (index > 0) {
				hexInputs.current[index].value = "";
				hexInputs.current[index - 1].focus();
			}
		}
	};

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
		} catch {
		} finally {
			setIsAssigningName(false);
		}
	};

	const handlePaste = (e: ClipboardEvent) => {
		const paste = e.clipboardData
			?.getData("text")
			.trim()
			.replace("#", "")
			.toUpperCase();

		if (paste && /^[a-fA-F0-9]{6}$/.test(paste)) {
			setHexDigits(paste?.split(""));

			hexInputs.current[5].focus();
		}
	};

	const router = useRouter();

	const handleSubmissionSelection = async (suggestion: string) => {
		suggestion = convertToTitleCase(suggestion);

		setIsAssigningName(true);

		try {
			const response = await fetch("/api/colors", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					hex,
					name: suggestion,
					price: 0
				})
			});

			if (response.ok) {
				router.push(
					`/success?color=${color}&hex=${hex}&name=${encodeURIComponent(
						suggestion
					)}`
				);
			}
		} catch {
		} finally {
			setIsAssigningName(false);
		}
	};

	const onNameChange = (input: string) => {
		setCustomName(input);
	};

	return (
		<div
			className={`gap-2 grid grid-cols-2 grid-rows-5 min-h-dvh w-screen p-4`}
			style={{
				backgroundColor: `#${hex}`
			}}
		>
			<Header color={color} />
			<div
				className="border col-span-1 hidden lg:flex flex-col gap-2 items-center justify-center p-2 row-span-4 rounded-lg"
				style={{ borderColor: color }}
			>
				<div className="flex flex-1 gap-2 w-full">
					<div
						className="flex flex-1 items-center justify-center text-2xl"
						style={{ color }}
					>
						#
					</div>
					{hexDigits.map((digit, index) => (
						<input
							className="aspect-square flex-1 min-h-12 min-w-12 rounded-lg text-center uppercase"
							key={index}
							maxLength={1}
							pattern="[0-9a-fA-F]"
							onChange={(e) =>
								handleHexInput(e.target.value, index)
							}
							onKeyDown={(e) => handleKeyNavigation(e, index)}
							onPaste={(e) => handlePaste(e)}
							ref={(element) => {
								if (element) {
									hexInputs.current[index] = element;
								}
							}}
							style={{
								backgroundColor: color,
								color: `#${hex}`
							}}
							value={digit}
						/>
					))}
					<button
						aria-label="Search for a specific color"
						className={`${
							hexDigits.every((digit) => digit.length) &&
							"cursor-pointer hover:opacity-80"
						} flex-2 h-full min-h-12 px-2 py-1 rounded-lg`}
						disabled={hexDigits.some((digit) => !digit.length)}
						onClick={() => handleColorSearch(hexDigits.join(""))}
						style={{
							backgroundColor: color,
							color: `#${hex}`
						}}
					>
						Search
					</button>
				</div>
				<div className="flex flex-4 items-center justify-center w-full">
					<p
						className="text-5xl"
						style={{
							color
						}}
					>
						#{hex ?? "000000"}
					</p>
				</div>
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
											className="cursor-pointer col-span-1 h-full min-h-12 hover:opacity-80 rounded-lg text-xs"
											disabled={isAssigningName}
											key={index}
											onClick={() =>
												handleSubmissionSelection(
													suggestion
												)
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
									className="min-h-12 pl-2 rounded-lg text-xs sm:text-base w-full"
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
									className="min-h-12 pl-2 rounded-lg text-xs sm:text-base w-full"
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
									placeholder={`Min price: $${formatPrice(
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
									"cursor-pointer hover:opacity-80"
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
										Max three words
									</span>
									<span>
										{isMoreThanThreeWords(customName)
											? "❌"
											: "✅"}
									</span>
								</li>
								<li className="contents">
									<span className="col-span-4 text-left">
										Letters, apostrophes, spaces, and
										hyphens only
									</span>
									<span>
										{!validCharacters.test(customName)
											? "❌"
											: "✅"}
									</span>
								</li>
								<li className="contents">
									<span className="col-span-4 text-left">
										Max 25 characters
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
										Bid at least the minimum price
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
