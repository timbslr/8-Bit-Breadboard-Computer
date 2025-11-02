import { escapeHTML } from "./util.js";

export default class InstructionsUtilProvider {
  static #instructions = null;

  static async loadInstructions() {
    if (this.#instructions) {
      return this.#instructions;
    }

    const response = await fetch("../resources/data/instructionData.json");
    const instructions = (await response.json()).instructions;
    this.#instructions = instructions;
    return this.#instructions;
  }

  static async getSortedInstructionObjectsByMnemonic() {
    const instructions = await this.loadInstructions();
    return [...instructions].sort((instr1, instr2) => instr1.mnemonic.localeCompare(instr2.mnemonic)); //shallow copy of instructions
  }

  static async getGroupedInstructionObjects() {
    const instructions = await this.loadInstructions();
    const groupedInstructions = Object.groupBy([...instructions], (instructions) => instructions.group); //shallow copy of instructions
    return groupedInstructions;
  }

  static async getInstructionObjectByMnemonic(mnemonic) {
    const instructions = await this.loadInstructions();
    return instructions.find((instruction) => instruction.mnemonic === mnemonic);
  }

  static async isMnemonicValid(mnemonic) {
    const instruction = await this.getInstructionObjectByMnemonic(mnemonic);
    return instruction !== undefined;
  }

  static async isPSEUDOInstruction(mnemonic) {
    const instruction = await this.getInstructionObjectByMnemonic(mnemonic);
    return instruction.type === "PSEUDO";
  }

  static extractMnemonicFromInstructionString(instructionString) {
    return instructionString.split(" ")[0];
  }

  static joinMnemonicWithOperands(mnemonic, operands) {
    return `${mnemonic} ${operands.map((operand) => `<${operand}>`).join(", ")}`;
  }

  static decorateMnemonicWithLink(mnemonic, linkLabel = undefined, linkTitle = undefined, redirectLink = undefined) {
    const label = linkLabel || mnemonic;
    const title = linkTitle ? `title="${linkTitle}` : "";
    const link = redirectLink || `./details#${mnemonic}`;
    return `<a href="${link}" ${title}">${label}</a>`;
  }

  static async joinAndDecorateMappedInstructionsWithLink(mappedInstructions, lineDelimiter = "<br>") {
    const decoratedInstructions = await Promise.all(
      mappedInstructions.map(async (instruction) => {
        instruction = escapeHTML(instruction);
        const mnemonic = this.extractMnemonicFromInstructionString(instruction);
        //if the mnemonic is valid, add a link to it
        const isMnemonicValid = await this.isMnemonicValid(mnemonic);
        if (isMnemonicValid) {
          instruction = instruction.replace(mnemonic, this.decorateMnemonicWithLink(mnemonic, mnemonic, false));
        }

        return instruction;
      })
    );

    return decoratedInstructions.join(lineDelimiter);
  }
}
