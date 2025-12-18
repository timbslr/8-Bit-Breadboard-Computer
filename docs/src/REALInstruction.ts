import Instruction from "./Instruction.js";
import { JSONInstruction, MicroInstructions } from "./types/InstructionTypes.js";

export default class REALInstruction extends Instruction {
  private opcode: string;
  private microInstructions: MicroInstructions;
  private needsFlag: boolean;

  constructor(instructionJSONObject: JSONInstruction) {
    super(instructionJSONObject);
    if (super.isPSEUDO()) {
      throw new TypeError("Instruction is not of type REAL");
    }

    if (
      !("opcode" in instructionJSONObject) ||
      !("microinstructions" in instructionJSONObject) ||
      !("requiresFlag" in instructionJSONObject)
    ) {
      throw new TypeError(
        `Instruction misses one or more of the following fields: opcode, microinstructions, requiresFlag`
      );
    }

    this.opcode = instructionJSONObject.opcode as string;
    this.microInstructions = instructionJSONObject.microinstructions as MicroInstructions;
    this.needsFlag = instructionJSONObject.requiresFlag as boolean;
  }

  getMicroinstructions(): string[] | { "0": string[]; "1": string[] } {
    return this.microInstructions;
  }

  getOpcode(): string {
    return this.opcode;
  }

  async getModifiedRegisters(): Promise<Set<string>> {
    const executedInstructions = await this.getExecutedInstructions();
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

  async getExecutedInstructions(): Promise<REALInstruction[]> {
    return [this];
  }

  requiresFlag(): boolean {
    return this.needsFlag;
  }

  async getAmountOfClockCyclesPerExecution(): Promise<{ flagLow: number; flagHigh: number }> {
    const microinstructions = this.getMicroinstructions();
    let flagLowMicroinstructions: string[];
    let flagHighMicroinstructions: string[];
    if (this.requiresFlag()) {
      flagLowMicroinstructions = microinstructions["0"] as string[];
      flagHighMicroinstructions = microinstructions["1"] as string[];
    } else {
      flagLowMicroinstructions = microinstructions as string[];
      flagHighMicroinstructions = microinstructions as string[];
    }

    return {
      flagLow: REALInstruction.countMicroinstructionsWithoutRSC(flagLowMicroinstructions),
      flagHigh: REALInstruction.countMicroinstructionsWithoutRSC(flagHighMicroinstructions),
    };
  }

  static countMicroinstructionsWithoutRSC(microinstructionsArray: string[]): number {
    const length = microinstructionsArray.length;
    if (microinstructionsArray[length - 1].includes("RSC")) {
      return length - 1;
    }
    return length;
  }
}
