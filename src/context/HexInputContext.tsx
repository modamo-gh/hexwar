"use client";

import {
	createContext,
	Dispatch,
	ReactNode,
	RefObject,
	SetStateAction,
	useContext,
	useRef,
	useState
} from "react";

type HexInputType = {
	handleHexInput: (digit: string, index: number) => void;
	handleKeyNavigation: (
		e: React.KeyboardEvent<HTMLInputElement>,
		index: number
	) => void;
	handlePaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
	hexDigits: string[];
	hexInputs: RefObject<HTMLInputElement[]>;
	setHexDigits: Dispatch<SetStateAction<string[]>>;
};

const HexInputContext = createContext<HexInputType | undefined>(undefined);

export const HexInputProvider: React.FC<{ children: ReactNode }> = ({
	children
}) => {
	const hexInputs = useRef<HTMLInputElement[]>(Array.from({ length: 6 }));

	const [hexDigits, setHexDigits] = useState<string[]>(
		Array.from<string>({ length: 6 }).fill("")
	);

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

		console.log(
			hexInputs.current.map((n, i) => [i, n?.outerHTML?.slice(0, 80)])
		);
	};

	const handleKeyNavigation = (
		e: React.KeyboardEvent<HTMLInputElement>,
		index: number
	) => {
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

	const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
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

	const value: HexInputType = {
		handleHexInput,
		handleKeyNavigation,
		handlePaste,
		hexDigits,
		hexInputs,
		setHexDigits
	};

	return (
		<HexInputContext.Provider value={value}>
			{children}
		</HexInputContext.Provider>
	);
};

export const useHexInput = () => {
	const context = useContext(HexInputContext);

	if (context === undefined) {
		throw new Error("useHexInput must be used within a HexInputProvider");
	}

	return context;
};
