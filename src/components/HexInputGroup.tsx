import { useHexInput } from "@/context/HexInputContext";

const HexInputGroup = ({ color, hex }: { color: string; hex: string }) => {
	const {
		handleHexInput,
		handleKeyNavigation,
		handlePaste,
		hexDigits,
		hexInputs
	} = useHexInput();

	return (
		<>
			{hexDigits.map((digit, index) => (
				<input
					className="col-span-2 sm:col-span-1 min-h-12 min-w-12 rounded-lg row-span-1 sm:row-span-2 text-center text-5xl uppercase"
					key={index}
					maxLength={1}
					pattern="[0-9a-fA-F]"
					onChange={(e) => handleHexInput(e.target.value, index)}
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
		</>
	);
};

export default HexInputGroup;
