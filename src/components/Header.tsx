"use client";

import { formatPrice } from "@/lib/format";
import Link from "next/link";
import { useEffect, useState } from "react";

const Header = ({ color }: { color: string }) => {
	const [count, setCount] = useState(0);
	const [highest, setHighest] = useState<{
		price: number;
		name: string;
		hex: string;
	} | null>(null);

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
			className="border col-span-2 flex flex-1 gap-2 items-center justify-between p-2 row-span-1 rounded-lg"
			style={{ borderColor: color, color }}
		>
			<div className="md:flex flex-col flex-1 hidden items-center justify-center text-center">
				<p className="opacity-80 text-sm">{count} of 16777216</p>
				<p className="opacity-80 text-sm">colors named</p>
			</div>
			<div className="flex flex-1 items-center justify-center text-center">
				<Link href="/">
					<h1 className="text-4xl sm:text-5xl tracking-widest">#HEXWAR</h1>
				</Link>
			</div>
			<div className="md:flex flex-col flex-1 hidden items-center justify-center text-center">
				<p className="opacity-80 text-sm">Most Valuable Color</p>
				<p className="opacity-80 text-sm">{highest?.name}</p>
				<p className="opacity-80 text-sm">#{highest?.hex ?? "000000"}</p>
				<p className="opacity-80 text-sm">${formatPrice(highest?.price ?? 0)}</p>
			</div>
		</header>
	);
};

export default Header;
