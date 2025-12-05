import Formatter from "./Formatter.js";
import { REGISTER_REGEX } from "./util.js";

export default class InstructionsUtilProvider {
  static #instructions = null;

  static async loadInstructions() {
    if (this.#instructions) {
      return this.#instructions;
    }

    const response = await fetch("../resources/data/instructionData.jsonc");
    const fileContent = await response.text();
    const cleanedContent = fileContent.replace(/\/\*[\s\S]*?\*\/|\/\/.*(?=[\n\r])/g, "");
    const instructions = JSON.parse(cleanedContent).instructions;
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
        instruction = Formatter.escapeHTML(instruction);
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

  static async getExecutedInstructions(instruction) {
    const isREALInstruction = !(await InstructionsUtilProvider.isPSEUDOInstruction(instruction.mnemonic));
    if (isREALInstruction) return [instruction];

    let executedInstructions = [];
    for (const mappedInstructionString of instruction.mappedInstructions) {
      const mappedInstructionMnemonic =
        InstructionsUtilProvider.extractMnemonicFromInstructionString(mappedInstructionString);

      const mappedInstruction = await InstructionsUtilProvider.getInstructionObjectByMnemonic(
        mappedInstructionMnemonic
      );
      const executedInstructionsForMappedInstruction = await this.getExecutedInstructions(mappedInstruction);
      executedInstructions = executedInstructions.concat(executedInstructionsForMappedInstruction);
    }

    return executedInstructions;
  }

  static async getClobberedRegisters(instruction) {
    const nonClobberedRegisters = ["PC_L", "PC_H", "MAR_L", "MAR_H", "IR", "SP_L", "SP_H", "F", "7SD", "<reg>", "BUF"];
    const modifiedRegisterArray = [...(await this.getModifiedRegisters(instruction))];
    return new Set(modifiedRegisterArray.filter((register) => !nonClobberedRegisters.includes(register)));
  }

  static async getModifiedRegisters(instruction) {
    if (instruction.mnemonic === "rorn") {
      const rorInstruction = await this.getInstructionObjectByMnemonic("ror");
      return new Set([...(await this.getModifiedRegisters(rorInstruction))].concat(["A"])); //A is modified during rotation
    }
    if (instruction.mnemonic === "roln") {
      const rolInstruction = await this.getInstructionObjectByMnemonic("rol");
      return new Set([...(await this.getModifiedRegisters(rolInstruction))].concat(["A"])); //A is modified during rotation
    }

    if (!(await this.isPSEUDOInstruction(instruction.mnemonic))) {
      return await this.getModifiedRegistersForREALInstruction(instruction);
    }

    let modifiedRegisters = new Set();

    for (let mappedInstructionString of instruction.mappedInstructions) {
      let match;
      while ((match = REGISTER_REGEX.exec(mappedInstructionString))) {
        const register = match[1];
        modifiedRegisters.add(register);
        mappedInstructionString = mappedInstructionString.replace(new RegExp(register, "gm"), "");
      }

      const mappedInstructionMnemonic = await this.extractMnemonicFromInstructionString(mappedInstructionString);
      const mappedInstruction = await this.getInstructionObjectByMnemonic(mappedInstructionMnemonic);
      modifiedRegisters = new Set(
        [...modifiedRegisters].concat([...(await this.getModifiedRegisters(mappedInstruction))])
      );
    }

    return modifiedRegisters;
  }

  static async getModifiedRegistersForREALInstruction(instruction) {
    const executedInstructions = await this.getExecutedInstructions(instruction);
    const modifiedRegisters = new Set();
    for (const executedInstruction of executedInstructions) {
      let microinstructions = executedInstruction.microinstructions;
      if (typeof microinstructions === "object") {
        //if true, its an instruction with requiresFlag: true, thus it contains the properties "0" and "1"
        microinstructions = microinstructions["0"].concat(microinstructions["1"]);
      }

      for (const microinstruction of microinstructions) {
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
}
