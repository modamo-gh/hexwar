"use client";

import useWindowWidth from "@/hooks/useWindowWidth";
import { formatPrice } from "@/lib/format";
import Link from "next/link";
import { useEffect, useState } from "react";
import SearchIcon from "./SearchIcon";
import HexInputGroup from "./HexInputGroup";
import { useHexInput } from "@/context/HexInputContext";

const Header = ({
	color,
	hex,
	setColor
}: {
	color: string;
	hex: string;
	setColor?: (c?: string) => Promise<void>;
}) => {
	const { hexDigits, setHexDigits } = useHexInput();

	const [count, setCount] = useState(0);
	const [highest, setHighest] = useState<{
		price: number;
		name: string;
		hex: string;
	} | null>(null);
	const [isSearching, setIsSearching] = useState(false);

	const width = useWindowWidth();

	useEffect(() => {
		const getStats = async () => {
			const response = await fetch("/api/colors/stats");
			const data = await response.json();

			setCount(data.count);
			setHighest(data.highest);
		};

		getStats();
	}, []);

	return (
		<header
			className="border-2 col-span-2 grid grid-cols-7 lg:grid-cols-6 grid-rows-2 p-2 rounded-lg row-span-1"
			style={{ borderColor: color, color }}
		>
			{width >= 1024 && (
				<div className="flex flex-col col-span-2 items-center justify-center row-span-2 text-center">
					<p className="opacity-80 text-sm">{count} of 16777216</p>
					<p className="opacity-80 text-sm">colors named</p>
				</div>
			)}
			<div className="col-span-6 lg:col-span-2 flex items-center justify-center row-span-2">
				{isSearching ? (
					<div className="gap-2 grid grid-cols-6 grid-rows-2 h-full">
						<HexInputGroup
							color={color}
							hex={hex}
						/>
					</div>
				) : (
					<Link href="/">
						<h1 className="text-4xl sm:text-5xl tracking-widest">
							#HEXWAR
						</h1>
					</Link>
				)}
			</div>
			{width < 1024 ? (
				<div
					className="hover:cursor-pointer flex col-span-1 items-center justify-center min-h-12 min-w-12 row-span-2"
					onClick={() => {
						const handleColorSearch = async (c: string) => {
							setColor?.(c);
						};

						if (isSearching && hexDigits.every((hd) => hd)) {
							handleColorSearch(hexDigits.join(""));

							setHexDigits(
								Array.from<string>({ length: 6 }).fill("")
							);
						}

						setIsSearching((prev) => {
							console.log(!prev);

							return !prev;
						});
					}}
				>
					<SearchIcon
						className="text-3xl sm:text-4xl"
						fill={color}
					/>
				</div>
			) : (
				<div className="flex flex-col col-span-1 lg:col-span-2 items-center justify-center row-span-2 text-center">
					<p className="opacity-80 text-sm">Most Valuable Color</p>
					<p className="opacity-80 text-sm">{highest?.name}</p>
					<p className="opacity-80 text-sm">
						#{highest?.hex ?? "000000"}
					</p>
					<p className="opacity-80 text-sm">
						${formatPrice(highest?.price ?? 0)}
					</p>
				</div>
			)}
		</header>
		// <header
		// 	className="  grid-cols-8 gap-2   "
		// 	style={{ borderColor: color, color }}
		// >
		// 	{width >= 1024 ? (

		// 	) : (
		// 		<div
		// 			className={`${
		// 				!isSearching ? "col-span-1" : "hidden"
		// 			} flex h-full items-center justify-center`}
		// 		>
		// 			{isSearching ? (
		// 				<div
		// 					className="flex flex-1 items-center justify-center text-2xl"
		// 					style={{ color }}
		// 				>
		// 					#
		// 				</div>
		// 			) : (
		// 				<SearchIcon
		// 					className="invisible text-3xl sm:text-4xl"
		// 					fill={color}
		// 				/>
		// 			)}
		// 		</div>
		// 	)}
		// 	<div
		// 		className={`flex ${
		// 			!isSearching ? "col-span-6" : "col-span-7"
		// 		} gap-2 h-full items-center justify-center text-center w-full`}
		// 	>
		// 		{isSearching && width < 1024 ? (

		// 		) : (

		// 		)}
		// 	</div>
		// 	{width >= 1024 ? (

		// 	) : (

		//
	);
};

export default Header;
