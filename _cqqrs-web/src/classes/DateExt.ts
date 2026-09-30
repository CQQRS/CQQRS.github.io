export {}

declare global {
    interface Date{
        getWeekNumber: () => number    
    }
}

Date.prototype.getWeekNumber = function (): number {

	// Source - https://stackoverflow.com/a/6117889
	// Posted by RobG, modified by community. See post 'Timeline' for change history
	// Retrieved 2026-09-10, License - CC BY-SA 4.0

	const now = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
	var dayNum = now.getUTCDay() || 7;
	now.setUTCDate(now.getUTCDate() + 4 - dayNum);
	const yearStart = new Date(Date.UTC(now.getUTCFullYear(),0,1));
	return Math.ceil((((now.getTime() - yearStart.getTime()) / 86400000) + 1)/7)
};