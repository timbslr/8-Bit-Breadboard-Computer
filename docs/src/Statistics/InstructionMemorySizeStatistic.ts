import Instruction from "../Instruction/Instruction.js";
import { InstructionStatistic } from "./InstructionStatistic.js";

const operandSizesInBytes = {
  reg: 0,
  regd: 0,
  regs: 0,
  regsd: 0,
  regss: 0,
  lcdreg: 0,
  imm: 1,
  addr: 2,
};

export class InstructionMemorySizeStatistic implements InstructionStatistic<number> {
  readonly name = "Size in ROM";

  constructor(private instruction: Instruction) {}

  value(): number {
    const executedInstructions = this.instruction.getExecutedInstructions();
    let byteSizeInROM = 0;

    for (const executedInstruction of executedInstructions) {
      byteSizeInROM += 1; //opcode of instruction
      for (const operand of executedInstruction.getAbstractOperands()) {
        const operandsSizeInROM: number = operandSizesInBytes[operand];
        byteSizeInROM += operandsSizeInROM;
      }
    }

    return byteSizeInROM;
  }

  formatted(): string {
    const memSize = this.value();
    return memSize === 1 ? "1 Byte" : `${memSize} Bytes`;
  }
}
