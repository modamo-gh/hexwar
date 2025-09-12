import { useColor } from "@/context/ColorContext";
import { useHexInput } from "@/context/HexInputContext";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import HexInputGroup from "./HexInputGroup";

const LeftPanel = () => {
	const {
		color,
		handleSubmissionSelection,
		hasName,
		hex,
		isAssigningName,
		isRetrievingNames,
		message,
		setColor,
		suggestions
	} = useColor();

	const { hexDigits, setHexDigits } = useHexInput();

	const {width} = useWindowDimensions();

	const handleColorSearch = async (c: string) => {
		setColor(c);

		setHexDigits(Array.from<string>({ length: 6 }).fill(""));
	};

	return (
		<div
			className="border-2 col-span-1 gap-2 lg:grid grid-cols-1 grid-rows-5 hidden p-2 place-items-center row-span-1 rounded-lg"
			style={{ borderColor: color }}
		>
			<div className="col-span-1 gap-2 grid grid-cols-9 grid-rows-1 h-full row-span-1">
				<div
					className="flex col-span-1 items-center justify-center text-center text-5xl"
					style={{ color }}
				>
					<p>#</p>
				</div>
				{width && width >= 1024 && (
					<HexInputGroup
						color={color}
						hex={hex}
					/>
				)}
				<button
					aria-label="Search for a specific color"
					className={`${
						hexDigits.every((digit) => digit.length) &&
						"cursor-pointer hover:opacity-80"
					} col-span-2 h-full min-h-12 rounded-lg row-span-1`}
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
			<p
				className="text-center text-xl w-4/5"
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
						Array.from({ length: 3 }).map((_, index) => {
							return (
								<div
									className={`${
										isRetrievingNames && "animate-pulse"
									} col-span-1 h-full rounded-lg row-span-1 w-4/5`}
									key={index}
									style={{
										backgroundColor: color
									}}
								/>
							);
						})
					) : (
						<>
							{suggestions.map((suggestion, index) => (
								<button
									className="cursor-pointer col-span-1 h-full min-h-12 hover:opacity-80 rounded-lg text-2xl w-4/5"
									disabled={isAssigningName}
									key={index}
									onClick={() =>
										handleSubmissionSelection(suggestion)
									}
									style={{
										backgroundColor: color,
										color: `#${hex}`
									}}
								>
									{suggestion}
								</button>
							))}
						</>
					)}
				</>
			)}
		</div>
	);
};

export default LeftPanel;
