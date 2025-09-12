import { useColor } from "@/context/ColorContext";
import useWindowWidth from "@/hooks/useWindowWidth";
import { convertToTitleCase, formatPrice } from "@/lib/format";
import {
	filter,
	isMoreThanThreeWords,
	isValidName,
	validCharacters
} from "@/lib/validation";
import { useState } from "react";
import DownArrow from "./icons/DownArrow";
import UpArrow from "./icons/UpArrow";

const RightPanel = () => {
	const {
		color,
		handleSubmissionSelection,
		hasName,
		hex,
		isAssigningName,
		isRetrievingNames,
		message,
		minimumPrice,
		price,
		setIsAssigningName,
		setMessage,
		setPrice,
		suggestions
	} = useColor();

	const [customName, setCustomName] = useState("");
	const [isExpanded, setIsExpanded] = useState(false);
	const [priceInput, setPriceInput] = useState("");

	const width = useWindowWidth();

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
			className="border-2 col-span-2 lg:col-span-1 flex flex-col gap-2 lg:grid lg:grid-cols-1 lg:grid-rows-2 items-center justify-around p-2 row-span-4 rounded-lg"
			style={{ borderColor: color }}
		>
			{width && width < 1024 && (
				<div className="flex flex-col gap-2 items-center justify-center row-span-2 w-full">
					<p
						className="text-center lg:text-xl w-4/5"
						style={{
							color,
							whiteSpace: "pre-line"
						}}
					>
						{message}
					</p>
					{!hasName && (
						<>
							{!suggestions.length ? (
								<div className="flex gap-2 w-full">
									{Array.from({ length: 3 }).map(
										(_, index) => {
											return (
												<div
													className={`${
														isRetrievingNames &&
														"animate-pulse"
													} lg:col-span-1 flex-1 h-full min-h-12 rounded-lg lg:text-2xl lg:w-4/5`}
													key={index}
													style={{
														backgroundColor: color
													}}
												/>
											);
										}
									)}
								</div>
							) : (
								<div className="gap-2 grid grid-cols-2 grid-rows-2 w-full">
									{suggestions.map((suggestion, index) => (
										<button
											className={`cursor-pointer ${
												index < 2
													? "col-span-1"
													: "col-span-2"
											} lg:col-span-1 min-h-12 hover:opacity-80 px-2 py-1 rounded-lg lg:text-2xl lg:w-4/5`}
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
						</>
					)}
				</div>
			)}
			<div
				className="flex flex-col gap-2 items-center lg:h-full justify-around lg:row-span-1 text-center"
				style={{ color }}
			>
				<div className="flex gap-2 items-center">
					<p>CUSTOM NAME RULES</p>
					{width && width < 1024 && (
						<div
							className="flex items-center justify-center min-h-12 min-w-12"
							onClick={() => setIsExpanded((prev) => !prev)}
						>
							{!isExpanded ? (
								<DownArrow
									fill={color}
									height={24}
									width={24}
								/>
							) : (
								<UpArrow
									fill={color}
									height={24}
									width={24}
								/>
							)}
						</div>
					)}
				</div>
				<ul
					className={`flex-1 gap-2 grid ${
						(width && width >= 1024) || isExpanded
							? "visible"
							: "hidden"
					} grid-cols-5 pl-4`}
				>
					<li className="contents">
						<span className="col-span-4 text-left">
							Max three words
						</span>
						<span>
							{isMoreThanThreeWords(customName) ? "❌" : "✅"}
						</span>
					</li>
					<li className="contents">
						<span className="col-span-4 text-left">
							Letters, apostrophes, spaces, and hyphens only
						</span>
						<span>
							{!validCharacters.test(customName) ? "❌" : "✅"}
						</span>
					</li>
					<li className="contents">
						<span className="col-span-4 text-left">
							Max 25 characters
						</span>
						<span>{customName.length > 25 ? "❌" : "✅"}</span>
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
						<span>{price >= minimumPrice + 100 ? "✅" : "❌"}</span>
					</li>
				</ul>
			</div>
			<div
				className={`flex flex-col flex-1 gap-2 lg:h-full items-center justify-around lg:row-span-1 w-full`}
			>
				<input
					aria-label="Custom color name"
					className="flex-1 min-h-12 pl-2 rounded-lg text-xs sm:text-base w-full"
					onChange={(e) => onNameChange(e.target.value)}
					placeholder="Enter color name"
					style={
						{
							color: `#${hex}`,
							backgroundColor: color,
							"--placeholder-color": `#${hex}50`
						} as React.CSSProperties
					}
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
						setPriceInput(cleaned ? formatPrice(cleaned) : "");
					}}
					placeholder={`Min price: $${formatPrice(
						minimumPrice + 100
					)}`}
					style={
						{
							color: `#${hex}`,
							backgroundColor: color,
							"--placeholder-color": `#${hex}50`
						} as React.CSSProperties
					}
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
		</div>
	);
};

export default RightPanel;
