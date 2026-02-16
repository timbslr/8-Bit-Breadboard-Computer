import Instruction from "../Instruction/Instruction.js";
import { InstructionStatistic } from "./InstructionStatistic.js";

export class InstructionCountStatistic implements InstructionStatistic<number> {
  readonly name = "Amount of instructions";

  constructor(private instructions: Instruction[]) {}

  value(): number {
    return this.instructions.length;
  }

  formatted(): string {
    return String(this.value());
  }
}
