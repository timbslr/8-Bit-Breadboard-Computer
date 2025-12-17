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
    const mnemonic = this.getMnemonic();
    if (mnemonic === "rorn" || mnemonic === "roln") {
      const newMnemonic = mnemonic.replace("n", "");
      return new Set(
        [...(await (await InstructionRepository.fromMnemonic(newMnemonic)).getModifiedRegisters())].concat(["A"])
      ); //A is modified during rotation
    }

    let modifiedRegisters: Set<string> = new Set();

    for (let mappedInstructionString of this.mappedInstructions) {
      let match;
      while ((match = REGISTER_REGEX.exec(mappedInstructionString))) {
        const register = match[1];
        modifiedRegisters.add(register);
        mappedInstructionString = mappedInstructionString.replace(new RegExp(register, "gm"), "");
      }

      const mappedInstructionMnemonic = await Instruction.extractMnemonicFromInstructionString(mappedInstructionString);
      const mappedInstruction = await InstructionRepository.fromMnemonic(mappedInstructionMnemonic);
      modifiedRegisters = new Set([...modifiedRegisters].concat([...(await mappedInstruction.getModifiedRegisters())]));
    }

    return modifiedRegisters;
  }

  async getExecutedInstructions(): Promise<REALInstruction[]> {
    let executedInstructions: REALInstruction[] = [];
    for (const mappedInstructionString of this.getMappedInstructions()) {
      const mappedInstructionMnemonic = Instruction.extractMnemonicFromInstructionString(mappedInstructionString);

      const mappedInstruction = await InstructionRepository.fromMnemonic(mappedInstructionMnemonic);
      const executedInstructionsForMappedInstruction = await mappedInstruction.getExecutedInstructions();
      executedInstructions = executedInstructions.concat(executedInstructionsForMappedInstruction);
    }

    return executedInstructions;
  }

  async getAmountOfClockCyclesPerExecution(): Promise<{ flagLow: string; flagHigh: string }> {
    const mnemonic = this.getMnemonic();
    //rorn and rol have to be handled separately because they have "n" as an argument
    if (mnemonic === "rorn" || mnemonic == "roln") {
      const rotateInstruction = await InstructionRepository.fromMnemonic(mnemonic.replace("n", ""));
      const clockCycles = await rotateInstruction.getAmountOfClockCyclesPerExecution();
      return {
        flagLow: `${clockCycles.flagLow}*n`,
        flagHigh: `${clockCycles.flagHigh}*n`,
      };
    }

    let numberOfClockCycles = { flagLow: "0", flagHigh: "0" }; //may differ if flag is low or high

    for (const instructionString of this.getMappedInstructions()) {
      const mnemonic = Instruction.extractMnemonicFromInstructionString(instructionString);
      const mappedInstruction = await InstructionRepository.fromMnemonic(mnemonic);
      const clockCyclesForMappedInstruction = await mappedInstruction.getAmountOfClockCyclesPerExecution();
      numberOfClockCycles = {
        flagLow: String(Number(numberOfClockCycles.flagLow) + Number(clockCyclesForMappedInstruction.flagLow)),
        flagHigh: String(Number(numberOfClockCycles.flagHigh) + Number(clockCyclesForMappedInstruction.flagHigh)),
      };
    }

    return numberOfClockCycles;
  }

  async getByteSizeInROM(): Promise<string> {
    //rorn and rol have to be handled separately because they have "n" as an argument
    if (this.getMnemonic() === "rorn" || this.getMnemonic() === "roln") {
      const sizeInBytes = await (
        (await InstructionRepository.fromMnemonic(this.getMnemonic().replace("n", ""))) as Instruction
      ).getByteSizeInROM();
      return sizeInBytes === "1" ? "n" : `${sizeInBytes}*n`;
    }

    return super.getByteSizeInROM();
  }
}
