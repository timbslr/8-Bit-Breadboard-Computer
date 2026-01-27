import Instruction from "./Instruction.js";
import { OperandInstance } from "./OperandInstance.js";

/**
 * This class represents an actual executable instance of an instruction, like: "addi B, 10"
 */
export class InstructionInstance {
  private readonly definition: Instruction;
  private readonly operands: OperandInstance[] = [];

  constructor(definition: Instruction, operands: OperandInstance[]);
  constructor(definition: Instruction, instructionInstanceString: string);
  constructor(definition: Instruction, arg2: OperandInstance[] | string) {
    this.definition = definition;
    if (Array.isArray(arg2)) {
      this.operands = arg2;
    } else {
      const operandInstances = Instruction.extractOperandsFromInstructionString(arg2);
      const operands = definition.getOperands();

      if (operandInstances.length !== operands.length) {
        throw new Error("Operand lengths not matching!");
      }

      for (let i = 0; i < operands.length; i++) {
        this.operands.push(new OperandInstance(operands[i].getName(), operandInstances[i]));
      }
    }
  }

  getDefinition(): Instruction {
    return this.definition;
  }

  getOperands(): OperandInstance[] {
    return this.operands;
  }

  instanceString(): string {
    const operandString = this.operands.join(", ");
    return this.definition.getMnemonic() + " " + operandString;
  }
}
