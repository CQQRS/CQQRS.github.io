export class TerminalOutput{
	
	private static _write(message: string, modifiers: TerminalModifier[]) {
		process.stdout.write(`${modifiers.join("")}${message}${TerminalModifier.Reset}`);
	}

	public static log(message: string): void {
		TerminalOutput._write(message, []);
	}

	public static success(message: string): void {
		TerminalOutput._write(message, [TerminalModifier.Green]);
	}	

	public static error(message: string): void {
		TerminalOutput._write(message, [TerminalModifier.Red]);
	}	

	public static bold(message: string): void {
		TerminalOutput._write(message, [TerminalModifier.Bold]);
	}
}

export enum TerminalModifier {
	Red    = "\x1b[31m",
	Green  = "\x1b[32m",
	Blue   = "\x1b[34m",
	Bold   = "\x1b[1m",
	Reset  = "\x1b[0m"
}