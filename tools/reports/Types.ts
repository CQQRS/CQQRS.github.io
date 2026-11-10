import type { QSO } from "./QSO";

export type TLog = Map<string, QSO[]>;

export class UsageError extends Error {}