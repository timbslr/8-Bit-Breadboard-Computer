export const REGISTER_LOOKUP = ["A", "B", "X", "TMP"];
export const LCDREGISTER_LOOKUP = ["CTRL", "DATA"];
export const REGISTER_REGEX = /(PC_L|PC_H|MAR_L|MAR_H|IR|BUF|SP_L|SP_H|A|F|TMP|B|X|7SD)/;

const operandSizesInBytes = {
  reg: 0,
  regd: 0,
  regs: 0,
  regsd: 0,
  regss: 0,
  lcdreg: 0,
  imm: 1,
  addr: 2,
};

export default class Instruction {
  #name;
  #mnemonic;
  #isPSEUDO;
  #requiresFlag;
  #operands;
  #group;
  #indexInGroup;
  #shortDescription;
  #longDescription;

  constructor(instructionJSONObject) {
    if (new.target === Instruction) {
      throw new Error("Cannot instantiate abstract class Instruction");
    }

    if (instructionJSONObject == null || instructionJSONObject instanceof Instruction) {
      throw new TypeError(
        "Instruction for initialization must not be null or undefined and has to be a plain object, not an instance of Instruction!"
      );
    }

    this.#isPSEUDO = instructionJSONObject.type === "PSEUDO";
    this.#name = instructionJSONObject.name;
    this.#mnemonic = instructionJSONObject.mnemonic;
    this.#requiresFlag = instructionJSONObject.requiresFlag;
    this.#operands = instructionJSONObject.operands;
    this.#group = instructionJSONObject.group;
    this.#indexInGroup = instructionJSONObject.indexInGroup;
    this.#shortDescription = instructionJSONObject.shortDescription;
    this.#longDescription = instructionJSONObject.longDescription;
  }

  /**
   * @returns {string}
   */
  getName() {
    return this.#name;
  }

  /**
   * @returns {boolean}
   */
  isPSEUDO() {
    return this.#isPSEUDO;
  }

  /**
   * @returns {string}
   */
  getMnemonic() {
    return this.#mnemonic;
  }

  /**
   * @returns {boolean}
   */
  requiresFlag() {
    return this.#requiresFlag;
  }

  /**
   * @returns {string}
   */
  getGroup() {
    return this.#group;
  }

  /**
   * @returns {number}
   */
  getIndexInGroup() {
    return this.#indexInGroup;
  }

  /**
   * @returns {string[]}
   */
  getOperands() {
    return this.#operands;
  }

  /**
   * @returns {string}
   */
  getShortDescription() {
    return this.#shortDescription;
  }

  /**
   * @returns {string}
   */
  getLongDescription() {
    return this.#longDescription;
  }

  static extractMnemonicFromInstructionString(instructionString) {
    return instructionString.split(" ")[0].trim();
  }

  async getExecutedInstructions() {
    throw new Error("getExecutedInstructions() is abstract and must be implemented");
  }

  async getModifiedRegisters() {
    throw new Error("getModifiedRegisters() is abstract and must be implemented");
  }

  static async getAmountOfClockCyclesPerExecution() {
    throw new Error("getAmountOfClockCyclesPerExecution() is abstract and must be implemented");
  }

  async getByteSizeInROM() {
    const executedInstructions = await this.getExecutedInstructions();
    let byteSizeInROM = 0;

    for (const executedInstruction of executedInstructions) {
      byteSizeInROM += 1; //opcode of instruction
      for (const operand of executedInstruction.getOperands()) {
        const operandsSizeInROM = operandSizesInBytes[operand];
        if (operandsSizeInROM === undefined) {
          console.error(
            `Found invalid operand "${operand}" during computation of the size in ROM for mnemonic "${this.#mnemonic}"`
          );
          return null;
        }

        byteSizeInROM += operandsSizeInROM;
      }
    }

    return byteSizeInROM;
  }

  async getClobberedRegisters() {
    const nonClobberedRegisters = ["PC_L", "PC_H", "MAR_L", "MAR_H", "IR", "SP_L", "SP_H", "F", "7SD", "<reg>", "BUF"];
    const modifiedRegisterArray = [...(await this.getModifiedRegisters())];
    return new Set(modifiedRegisterArray.filter((register) => !nonClobberedRegisters.includes(register)));
  }
}
