"use client";

import { useEffect, useState } from "react";

const useWindowDimensions = () => {
	const [height, setHeight] = useState<number | undefined>(undefined);
	const [width, setWidth] = useState<number | undefined>(undefined);

	useEffect(() => {
		const onResize = () => {
			setHeight(window.innerHeight);
			setWidth(window.innerWidth);
		};

		onResize();

		window.addEventListener("resize", onResize);

		return () => window.removeEventListener("resize", onResize);
	}, []);

	return { height, width };
};

export default useWindowDimensions;
