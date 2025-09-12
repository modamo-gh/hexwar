export const convertToTitleCase = (name: string) => {
	return name
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.map((word) => `${word[0].toUpperCase()}${word.slice(1).toLowerCase()}`)
		.join(" ");
};

export const formatPrice = (cents: number) => {
	return `${Math.floor(cents / 100)}.${Math.floor(cents % 100)
		.toString()
		.padStart(2, "0")}`;
};
