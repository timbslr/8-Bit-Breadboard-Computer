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

export default abstract class Instruction {
  private name: string;
  private mnemonic: string;
  private type: "REAL" | "PSEUDO";
  private needsFlag: boolean;
  private operands: string[];
  private group: string;
  private indexInGroup: number;
  private shortDescription: string;
  private longDescription: string;

  constructor(instructionJSONObject) {
    if (instructionJSONObject == null || instructionJSONObject instanceof Instruction) {
      throw new TypeError(
        "Instruction for initialization must not be null or undefined and has to be a plain object, not an instance of Instruction!"
      );
    }

    this.type = instructionJSONObject.type;
    this.name = instructionJSONObject.name;
    this.mnemonic = instructionJSONObject.mnemonic;
    this.needsFlag = instructionJSONObject.requiresFlag;
    this.operands = instructionJSONObject.operands;
    this.group = instructionJSONObject.group;
    this.indexInGroup = instructionJSONObject.indexInGroup;
    this.shortDescription = instructionJSONObject.shortDescription;
    this.longDescription = instructionJSONObject.longDescription;
  }

  getName(): string {
    return this.name;
  }

  isPSEUDO(): boolean {
    return this.type === "PSEUDO";
  }

  getMnemonic(): string {
    return this.mnemonic;
  }

  requiresFlag(): boolean {
    return this.needsFlag;
  }

  getGroup(): string {
    return this.group;
  }

  /**
   * @returns {number}
   */
  getIndexInGroup() {
    return this.indexInGroup;
  }

  getOperands(): string[] {
    return this.operands;
  }

  getShortDescription(): string {
    return this.shortDescription;
  }

  getLongDescription(): string {
    return this.longDescription;
  }

  static extractMnemonicFromInstructionString(instructionString: string) {
    return instructionString.split(" ")[0].trim();
  }

  abstract getExecutedInstructions(): Promise<Instruction[]>;

  abstract getModifiedRegisters(): Promise<Set<string>>;

  static async getAmountOfClockCyclesPerExecution(): Promise<string>;

  async getByteSizeInROM(): Promise<number> {
    const executedInstructions = await this.getExecutedInstructions();
    let byteSizeInROM = 0;

    for (const executedInstruction of executedInstructions) {
      byteSizeInROM += 1; //opcode of instruction
      for (const operand of executedInstruction.getOperands()) {
        const operandsSizeInROM = operandSizesInBytes[operand];
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
