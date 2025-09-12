import { useColor } from "@/context/ColorContext";
import { convertToTitleCase, formatPrice } from "@/lib/format";
import {
	filter,
	isMoreThanThreeWords,
	isValidName,
	validCharacters
} from "@/lib/validation";
import { useState } from "react";

const RightPanel = () => {
	const {
		color,
		hex,
		isAssigningName,
		minimumPrice,
		price,
		setIsAssigningName,
		setMessage,
		setPrice
	} = useColor();

	const [customName, setCustomName] = useState("");
	const [hasNameBeenSelected] = useState(false);
	const [priceInput, setPriceInput] = useState("");

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

	const onNameChange = (input: string) => {
		setCustomName(input);
	};

	return (
		<div
			className="border-2 col-span-2 lg:col-span-1 grid grid-cols-1 grid-rows-2 items-center justify-around p-2 row-span-4 rounded-lg"
			style={{ borderColor: color }}
		>
			{!hasNameBeenSelected && (
				<>
					<div className="flex flex-col gap-2 h-full items-center justify-around row-span-1 w-full">
						<input
							aria-label="Custom color name"
							className="flex-1 min-h-12 pl-2 rounded-lg text-xs sm:text-base w-full"
							onChange={(e) => onNameChange(e.target.value)}
							placeholder="Enter color name"
							style={{
								color: `#${hex}`,
								backgroundColor: color,
								"--placeholder-color": `#${hex}50`
							}}
							type="text"
							value={customName}
						/>
						<input
							aria-label="Your bid in dollars"
							className="flex-1 min-h-12 pl-2 rounded-lg text-xs sm:text-base w-full"
							inputMode="decimal"
							onChange={(e) => {
								const v = e.target.value;

								const cleaned = Number(v.replace(/\D/g, ""));

								setPrice(cleaned);
								setPriceInput(
									cleaned ? formatPrice(cleaned) : ""
								);
							}}
							placeholder={`Min price: $${formatPrice(
								minimumPrice + 100
							)}`}
							style={{
								color: `#${hex}`,
								backgroundColor: color,
								"--placeholder-color": `#${hex}50`
							}}
							value={priceInput}
						/>
						<button
							aria-label="Submit your color name and bid"
							className={`${
								isValidName(customName) &&
								!isAssigningName &&
								price >= minimumPrice + 100 &&
								"cursor-pointer hover:opacity-80"
							} flex-1 min-h-12 px-2 py-1 rounded-lg w-3/5`}
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
						className="flex flex-col gap-2 h-full items-center justify-around pt-2 row-span-1 text-center"
						style={{ color }}
					>
						{<p>CUSTOM NAME RULES</p>}
						<ul className="flex-1 gap-2 grid grid-cols-5 pl-4">
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
									Letters, apostrophes, spaces, and hyphens
									only
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
									{filter.isProfane(customName) ? "❌" : "✅"}
								</span>
							</li>
							<li className="contents">
								<span className="col-span-4 text-left">
									Bid at least the minimum price
								</span>
								<span>
									{price >= minimumPrice + 100 ? "✅" : "❌"}
								</span>
							</li>
						</ul>
					</div>
				</>
			)}
		</div>
	);
};

export default RightPanel;
