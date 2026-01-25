import DataProvider from "../DataProvider.js";
import Instruction from "./Instruction.js";

export default class InstructionRepository {
  /**
   * Creates an instruction object from a given mnemonic
   * If that mnemonic doesn't exist in the ISA, a TypeError is thrown
   */
  static async fromMnemonic(mnemonic: string): Promise<Instruction | null> {
    const instructions = await DataProvider.getInstructions();
    const instruction = instructions.find((instruction) => instruction.getMnemonic() === mnemonic);
    if (!instruction) {
      return null;
    }

    return instruction;
  }

  static async isMnemonicValid(mnemonic: string): Promise<boolean> {
    if (mnemonic == null) {
      return false;
    }

    const instruction = await this.fromMnemonic(mnemonic);
    return instruction != null;
  }

  /**
   * @returns Instruction objects, sorted by their mnemonics in ascending alphabetical order
   */
  static async getSorted() {
    const instructions = await DataProvider.getInstructions();
    return [...instructions].sort((instr1, instr2) => instr1.getMnemonic().localeCompare(instr2.getMnemonic())); //shallow copy of instructions
  }

  static async getGrouped() {
    const instructions = await DataProvider.getInstructions();
    const groupedInstructions = Object.groupBy([...instructions], (instruction) => instruction.getGroup()); //shallow copy of instructions
    return groupedInstructions;
  }
}
