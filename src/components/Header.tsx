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
		<div
			className="border flex flex-1 col-span-2 items-center justify-center row-span-1 rounded"
			style={{ borderColor: color, color }}
		>
			<div className="flex flex-col flex-1 items-center justify-center">
				<p>{count} of 16777216</p>
				<p> colors named</p>
			</div>
			<div className="flex-1">
				<Link href="/">
					<h1 className="text-5xl tracking-widest">#HEXWAR</h1>
				</Link>
			</div>
			<div className="flex flex-col flex-1 items-center justify-center">
				<p>Most Valuable Color</p>
				<p>{highest?.name}</p>
				<p>#{highest?.hex}</p>
				<p>${formatPrice(highest?.price ?? 0)}</p>
			</div>
		</div>
	);
};

export default Header;
