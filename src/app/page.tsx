"use client";

import Header from "@/components/Header";
import LeftPanel from "@/components/LeftPanel";
import RightPanel from "@/components/RightPanel";
import { useColor } from "@/context/ColorContext";
import useWindowWidth from "@/hooks/useWindowWidth";
import { useEffect } from "react";

const Home = () => {
	const { hex, setColor, setMessage } = useColor();

	const width = useWindowWidth();

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
			className={`gap-2 grid grid-cols-2 grid-rows-5 min-h-dvh w-screen p-4`}
			style={{
				backgroundColor: `#${hex}`
			}}
		>
			<Header />
			<LeftPanel />
			<RightPanel />
		</div>
	);
};

export default Home;
