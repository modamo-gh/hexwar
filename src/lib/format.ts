export const formatPrice = (cents: number) => {
	return `${Math.floor(cents / 100)}.${Math.floor(cents % 100)
		.toString()
		.padStart(2, "0")}`;
};
