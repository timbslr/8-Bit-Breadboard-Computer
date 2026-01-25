import Instruction, { REGISTER_REGEX } from "./Instruction.js";
import REALInstruction from "./REALInstruction.js";
import { PSEUDOInstructionProperties } from "./InstructionTypes.js";
import { InstructionInstance } from "./InstructionInstance.js";

/**
 * This class represents a PSEUDO-Instruction defined in the ISA and contains all the
 * parsed information about it (which is defined in the instructionData.jsonc file)
 */
export default class PSEUDOInstruction extends Instruction {
  private mappedInstructions: InstructionInstance[];

  constructor(instructionJSONObject: PSEUDOInstructionProperties) {
    super(instructionJSONObject);
    this.mappedInstructions = instructionJSONObject.mappedInstructions;
  }

  getMappedInstructions(): InstructionInstance[] {
    return this.mappedInstructions;
  }

  getModifiedRegisters(): Set<string> {
    let modifiedRegisters: Set<string> = new Set();

    for (const mappedInstruction of this.getMappedInstructions()) {
      let match;
      let mappedInstructionString = mappedInstruction.getInstanceString();
      while ((match = REGISTER_REGEX.exec(mappedInstructionString))) {
        const register = match[1];
        modifiedRegisters.add(register);
        mappedInstructionString = mappedInstructionString.replace(new RegExp(register, "gm"), "");
      }

      modifiedRegisters = new Set([...modifiedRegisters].concat([...mappedInstruction.getDefinition().getModifiedRegisters()]));
    }

    return modifiedRegisters;
  }

  getExecutedInstructions(): REALInstruction[] {
    let executedInstructions: REALInstruction[] = [];

    for (const mappedInstruction of this.getMappedInstructions()) {
      const executedInstructionsForMappedInstruction = mappedInstruction.getDefinition().getExecutedInstructions();
      executedInstructions = executedInstructions.concat(executedInstructionsForMappedInstruction);
    }

    return executedInstructions;
  }
}
