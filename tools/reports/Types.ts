import { Callsign } from "../../models/Callsign";
import type { QSO } from "./QSO";

export type TLog = Map<Callsign, QSO[]>;
;

export class UsageError extends Error {}