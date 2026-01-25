import Instruction from "./Instruction.js";
import { MicroInstructions, REALInstructionProperties } from "./InstructionTypes.js";
import { Opcode } from "./Opcode.js";

/**
 * This class represents a REAL-Instruction defined in the ISA and contains all the
 * parsed information about it (which is defined in the instructionData.jsonc file)
 */
export default class REALInstruction extends Instruction {
  private opcode: Opcode;
  private microInstructions: MicroInstructions;
  private needsFlag: boolean;

  constructor(instr: REALInstructionProperties) {
    super(instr);

    this.opcode = instr.opcode;
    this.microInstructions = instr.microinstructions;
    this.needsFlag = instr.requiresFlag;
  }

  getMicroinstructions(): string[] | { "0": string[]; "1": string[] } {
    return this.microInstructions;
  }

  getOpcode(): Opcode {
    return this.opcode;
  }

  getModifiedRegisters(): Set<string> {
    const executedInstructions = this.getExecutedInstructions();
    const modifiedRegisters: Set<string> = new Set();
    for (const executedInstruction of executedInstructions) {
      let microinstructions = executedInstruction.getMicroinstructions();
      if (this.requiresFlag()) {
        //if true, its an instruction with requiresFlag: true, thus it contains the properties "0" and "1"
        const firstHalf = microinstructions["0"] as string[];
        const secondHalf = microinstructions["1"] as string[];
        microinstructions = firstHalf.concat(secondHalf);
      }

      for (const microinstruction of microinstructions as string[]) {
        for (const controlString of microinstruction) {
          let match;
          if ((match = /IE_(.*)|li (\w+),/.exec(controlString))) {
            modifiedRegisters.add(match[1]);
          }
        }
      }
    }

    return modifiedRegisters;
  }

  getExecutedInstructions(): REALInstruction[] {
    return [this];
  }

  requiresFlag(): boolean {
    return this.needsFlag;
  }

  static countMicroinstructionsWithoutRSC(microinstructionsArray: string[]): number {
    const length = microinstructionsArray.length;
    if (microinstructionsArray[length - 1].includes("RSC")) {
      return length - 1;
    }
    return length;
  }
}
