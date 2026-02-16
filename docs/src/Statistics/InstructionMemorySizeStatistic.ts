import Instruction from "../Instruction/Instruction.js";
import { Statistic } from "./Statistic.js";
import "../Extensions/ArrayExtension.js";

export class InstructionMemorySizeStatistic implements Statistic<number> {
  readonly name = "Size in Memory";

  constructor(private instruction: Instruction) {}

  value(): number {
    const executedInstructions = this.instruction.getExecutedInstructions();
    let size = 0;

    for (const executedInstruction of executedInstructions) {
      size++; //opcode of instruction
      size += executedInstruction
        .getOperands()
        .map((operand) => operand.sizeInMemory())
        .sum();
    }

    return size;
  }

  formatted(): string {
    const memSize = this.value();
    return memSize === 1 ? "1 Byte" : `${memSize} Bytes`;
  }
}
