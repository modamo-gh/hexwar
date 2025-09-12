"use client";

import useWindowWidth from "@/hooks/useWindowWidth";
import { formatPrice } from "@/lib/format";
import Link from "next/link";
import { useEffect, useState } from "react";
import SearchIcon from "./SearchIcon";
import HexInputGroup from "./HexInputGroup";
import { useHexInput } from "@/context/HexInputContext";
import { useColor } from "@/context/ColorContext";

const Header = () => {
	const { color, hex, setColor } = useColor();
	const { hexDigits, setHexDigits } = useHexInput();

	const [count, setCount] = useState<null | number>(null);
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
			{width && width >= 1024 && (
				<div className="col-span-2 flex flex-col gap-2 items-center justify-center row-span-2 text-center">
					{count !== null ? (
						<p className="opacity-80 text-sm">
							{count} of 16777216
						</p>
					) : (
						<div
							className="animate-pulse h-3.5 rounded-lg w-2/5"
							style={{
								backgroundColor: color
							}}
						/>
					)}
					{count !== null ? (
						<p className="opacity-80 text-sm">colors named</p>
					) : (
						<div
							className="animate-pulse h-3.5 rounded-lg w-2/5"
							style={{
								backgroundColor: color
							}}
						/>
					)}
				</div>
			)}
			<div className="col-span-6 lg:col-span-2 flex items-center justify-center row-span-2">
				{isSearching ? (
					<div className="gap-2 grid grid-cols-6 grid-rows-2 h-full">
						{width && width < 1024 && (
							<HexInputGroup
								color={color}
								hex={hex}
							/>
						)}
					</div>
				) : (
					<Link href="/">
						<h1 className="text-4xl sm:text-5xl tracking-widest">
							#HEXWAR
						</h1>
					</Link>
				)}
			</div>
			{width && width < 1024 ? (
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
				<div className="col-span-1 lg:col-span-2 flex flex-col gap-2 items-center justify-center row-span-2 text-center">
					<p className="opacity-80 text-sm">Most Valuable Color</p>
					{highest !== null ? (
						<>
							<p className="opacity-80 text-sm">
								{highest?.name}
							</p>
							<p className="opacity-80 text-sm">
								#{highest?.hex ?? "000000"}
							</p>
							<p className="opacity-80 text-sm">
								${formatPrice(highest?.price ?? 0)}
							</p>
						</>
					) : (
						<>
							<div
								className="animate-pulse h-3.5 rounded-lg w-2/5"
								style={{
									backgroundColor: color
								}}
							/>
							<div
								className="animate-pulse h-3.5 rounded-lg w-2/5"
								style={{
									backgroundColor: color
								}}
							/>
							<div
								className="animate-pulse h-3.5 rounded-lg w-2/5"
								style={{
									backgroundColor: color
								}}
							/>
						</>
					)}
				</div>
			)}
		</header>
	);
};

export default Header;
