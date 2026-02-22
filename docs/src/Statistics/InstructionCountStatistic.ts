import Instruction from "../Instruction/Instruction.js";
import { Statistic } from "./Statistic.js";

export class InstructionCountStatistic implements Statistic<number> {
  readonly name = "Amount of instructions";

  constructor(private instructions: Instruction[]) {}

  value(): number {
    return this.instructions.length;
  }

  formatted(): string {
    return String(this.value());
  }
}
