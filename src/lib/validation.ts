import { Filter } from "bad-words";

export const filter = new Filter();

export const isMoreThanThreeWords = (input: string) => {
	const words = input.trim().split(/\s+/).filter(Boolean);

	return words.length > 3;
};

export const validCharacters = /^[a-zA-Z '\-]+$/;

export const isValidName = (name: string) => {
	name = name.trim();

	return (
		!!name.length &&
		validCharacters.test(name) &&
		!isMoreThanThreeWords(name) &&
		name.length <= 25 &&
		!filter.isProfane(name)
	);
};
