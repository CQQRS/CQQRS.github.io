export function getCurrentEdition(): string {
	const today = new Date();
	return `${today.getFullYear()}_${today.getWeekNumber()}`;
};