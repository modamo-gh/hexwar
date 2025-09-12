"use client";

import useWindowWidth from "@/hooks/useWindowWidth";
import {
	createContext,
	Dispatch,
	ReactNode,
	SetStateAction,
	useContext,
	useMemo,
	useState
} from "react";

type ColorContextType = {
	color: string;
	hasName: boolean;
	hex: string;
	isAssigningName: boolean;
	isRetrievingNames: boolean;
	message: string;
	minimumPrice: number;
	price: number;
	setColor: (c?: string) => Promise<void>;
	setIsAssigningName: Dispatch<SetStateAction<boolean>>;
	setMessage: Dispatch<SetStateAction<string>>;
	setPrice: Dispatch<SetStateAction<number>>;
	suggestions: string[];
};

const ColorContext = createContext<ColorContextType | undefined>(undefined);

export const ColorProvider: React.FC<{ children: ReactNode }> = ({
	children
}) => {
	type Color = {
		red: number;
		green: number;
		blue: number;
	};

	const [hasName, setHasName] = useState(false);
	const [isAssigningName, setIsAssigningName] = useState(false);
	const [isRetrievingNames, setIsRetrievingNames] = useState(false);
	const [message, setMessage] = useState("");
	const [minimumPrice, setMinimumPrice] = useState(0);
	const [price, setPrice] = useState(0);
	const [rgb, setRGB] = useState<Color>({
		red: 0,
		green: 0,
		blue: 0
	});
	const [suggestions, setSuggestions] = useState<string[]>([]);

	const width = useWindowWidth();

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

	const getLuminance = ({ red, green, blue }: Color) => {
		const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;

		return luminance > 0.5 ? "black" : "white";
	};

	const color = useMemo(() => {
		return getLuminance(rgb);
	}, [rgb]);
	const hex = useMemo(() => {
		return convertRGBToHex(rgb);
	}, [rgb]);

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
			const response = await fetch(`/api/colors/${localHex}`, {
				method: "GET"
			});

			const data = await response.json();

			setHasName(!!data.name);

			if (!data.name) {
				setMessage(
					`${
						width && width >= 1024 ? "This color" : `#${localHex}`
					} hasn't been named yet!\nHere are some suggestions:`
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

	const value: ColorContextType = {
		color,
		hasName,
		hex,
		isAssigningName,
		isRetrievingNames,
		message,
		minimumPrice,
		price,
		setColor,
		setIsAssigningName,
		setMessage,
		setPrice,
		suggestions
	};

	return (
		<ColorContext.Provider value={value}>{children}</ColorContext.Provider>
	);
};

export const useColor = () => {
	const context = useContext(ColorContext);

	if (context === undefined) {
		throw new Error("useColor must be used within a ColorProvider");
	}

	return context;
};
