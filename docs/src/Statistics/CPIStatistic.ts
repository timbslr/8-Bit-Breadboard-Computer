import { InstructionStatistic } from "./InstructionStatistic.js";

export class CPIStatistic implements InstructionStatistic<number> {
  readonly name = "CPI";
  value(): number {
    throw new Error("Method not implemented.");
  }
  formatted(): string {
    throw new Error("Method not implemented.");
  }
}
