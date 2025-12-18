import Instruction, { REGISTER_REGEX } from "./Instruction.js";
import InstructionRepository from "./InstructionRepository.js";
import REALInstruction from "./REALInstruction.js";
import { JSONInstruction } from "./types/InstructionTypes.js";

export default class PSEUDOInstruction extends Instruction {
  private mappedInstructions: string[];

  constructor(instructionJSONObject: JSONInstruction) {
    super(instructionJSONObject);
    if (!super.isPSEUDO()) {
      throw new TypeError("Instruction is not of type PSEUDO");
    }

    this.mappedInstructions = instructionJSONObject.mappedInstructions as string[];
  }

  getMappedInstructions(): string[] {
    return this.mappedInstructions;
  }

  async getModifiedRegisters(): Promise<Set<string>> {
    let modifiedRegisters: Set<string> = new Set();

    for (let mappedInstructionString of this.mappedInstructions) {
      let match;
      while ((match = REGISTER_REGEX.exec(mappedInstructionString))) {
        const register = match[1];
        modifiedRegisters.add(register);
        mappedInstructionString = mappedInstructionString.replace(new RegExp(register, "gm"), "");
      }

      const mappedInstructionMnemonic = Instruction.extractMnemonicFromInstructionString(mappedInstructionString);
      const mappedInstruction = (await InstructionRepository.fromMnemonic(mappedInstructionMnemonic)) as Instruction;
      modifiedRegisters = new Set([...modifiedRegisters].concat([...(await mappedInstruction.getModifiedRegisters())]));
    }

    return modifiedRegisters;
  }

  async getExecutedInstructions(): Promise<REALInstruction[]> {
    let executedInstructions: REALInstruction[] = [];

    for (const mappedInstructionString of this.getMappedInstructions()) {
      const mappedInstructionMnemonic = Instruction.extractMnemonicFromInstructionString(mappedInstructionString);

      const mappedInstruction = await InstructionRepository.fromMnemonic(mappedInstructionMnemonic);
      if (!mappedInstruction) {
        continue;
      }
      const executedInstructionsForMappedInstruction = await mappedInstruction.getExecutedInstructions();
      executedInstructions = executedInstructions.concat(executedInstructionsForMappedInstruction);
    }

    return executedInstructions;
  }

  async getAmountOfClockCyclesPerExecution(): Promise<{ flagLow: number; flagHigh: number }> {
    let numberOfClockCycles = { flagLow: 0, flagHigh: 0 }; //may differ if flag is low or high

    for (const instructionString of this.getMappedInstructions()) {
      const mnemonic = Instruction.extractMnemonicFromInstructionString(instructionString);
      const mappedInstruction = (await InstructionRepository.fromMnemonic(mnemonic)) as Instruction;
      const clockCyclesForMappedInstruction = await mappedInstruction.getAmountOfClockCyclesPerExecution();
      numberOfClockCycles = {
        flagLow: numberOfClockCycles.flagLow + clockCyclesForMappedInstruction.flagLow,
        flagHigh: numberOfClockCycles.flagHigh + clockCyclesForMappedInstruction.flagHigh,
      };
    }

    return numberOfClockCycles;
  }
}
