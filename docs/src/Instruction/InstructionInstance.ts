import Instruction from "./Instruction.js";
import InstructionRepository from "./InstructionRepository.js";
import { Operand } from "./Operand.js";

/**
 * This class represents an actual executable instance of an instruction, like: "addi B, 10"
 */
export class InstructionInstance {
  private readonly definition: Instruction;
  private readonly operands: Operand[];
  private readonly instanceString: string;

  constructor(definition: Instruction, operands: Operand[]);
  constructor(definition: Instruction, instructionInstanceString: string);
  constructor(definition: Instruction, arg2: Operand[] | string) {
    this.definition = definition;
    if (Array.isArray(arg2)) {
      this.operands = arg2;
      const operandString = this.operands.join(", ");
      this.instanceString = this.definition.getMnemonic() + " " + operandString;
    } else {
      this.operands = [new Operand()]; //TODO
      this.instanceString = arg2;
    }
  }

  getDefinition(): Instruction {
    return this.definition;
  }

  getOperands(): Operand[] {
    return this.operands;
  }

  getInstanceString(): string {
    return this.instanceString;
  }
}
