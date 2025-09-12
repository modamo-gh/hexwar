"use client";

import Header from "@/components/Header";
import LeftPanel from "@/components/LeftPanel";
import RightPanel from "@/components/RightPanel";
import { useColor } from "@/context/ColorContext";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { useEffect } from "react";

const Home = () => {
	const { hex, setColor, setMessage } = useColor();

	const { height, width } = useWindowDimensions();

	useEffect(() => {
		setColor();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		setMessage(
			`${
				width && width >= 1024 ? "This color" : `#${hex}`
			} hasn't been named yet!\nThese names are freebies:`
		);
	}, [hex, width]);

	return (
		<div
			className={`flex flex-col gap-4 min-h-dvh w-screen p-4`}
			style={{
				backgroundColor: `#${hex}`
			}}
		>
			<Header />
			<div
				className="flex-1 gap-4 grid grid-cols-2 grid-rows-1 w-full"
				style={{
					height: height ? `${0.8 * (height - 16)}px` : "auto"
				}}
			>
				<LeftPanel />
				<RightPanel />
			</div>
		</div>
	);
};

export default Home;
