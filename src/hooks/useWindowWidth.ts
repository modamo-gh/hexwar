"use client";

import { useEffect, useState } from "react";

const useWindowWidth = () => {
	const [width, setWidth] = useState(typeof window === "undefined" ? 0 : window.innerWidth);

	useEffect(() => {
		const onResize = () => {
			setWidth(window.innerWidth);
		};

		onResize();

		window.addEventListener("resize", onResize);

		return () => window.removeEventListener("resize", onResize);
	}, []);

	return width;
};

export default useWindowWidth;
