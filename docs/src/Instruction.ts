import REALInstruction from "./REALInstruction";
import { InstructionType, JSONInstruction } from "./types/InstructionTypes";

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

type Operand = keyof typeof operandSizesInBytes;

export default abstract class Instruction {
  private name: string;
  private mnemonic: string;
  private type: InstructionType;
  private operands: Operand[];
  private group: string;
  private indexInGroup: number;
  private shortDescription: string;
  private longDescription: string;

  constructor(instructionJSONObject: JSONInstruction) {
    if (instructionJSONObject == null || instructionJSONObject instanceof Instruction) {
      throw new TypeError(
        "Instruction for initialization must not be null or undefined and has to be a plain object, not an instance of Instruction!"
      );
    }

    if (instructionJSONObject.type !== "REAL" && instructionJSONObject.type !== "PSEUDO") {
      throw new TypeError(`Instruction type can only be REAL or PSEUDO, but was ${instructionJSONObject.type}`);
    }

    this.type = instructionJSONObject.type as InstructionType;
    this.name = instructionJSONObject.name;
    this.mnemonic = instructionJSONObject.mnemonic;
    this.operands = instructionJSONObject.operands as Operand[];
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

  getGroup(): string {
    return this.group;
  }

  getIndexInGroup(): number {
    return this.indexInGroup;
  }

  getOperands(): Operand[] {
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

  abstract getExecutedInstructions(): Promise<REALInstruction[]>;

  abstract getModifiedRegisters(): Promise<Set<string>>;

  abstract getAmountOfClockCyclesPerExecution(): Promise<{ flagLow: string; flagHigh: string }>;

  async getByteSizeInROM(): Promise<string> {
    const executedInstructions = await this.getExecutedInstructions();
    let byteSizeInROM = 0;

    for (const executedInstruction of executedInstructions) {
      byteSizeInROM += 1; //opcode of instruction
      for (const operand of executedInstruction.getOperands()) {
        const operandsSizeInROM: number = operandSizesInBytes[operand];
        byteSizeInROM += operandsSizeInROM;
      }
    }

    return byteSizeInROM.toString();
  }

  async getClobberedRegisters() {
    const nonClobberedRegisters = ["PC_L", "PC_H", "MAR_L", "MAR_H", "IR", "SP_L", "SP_H", "F", "7SD", "<reg>", "BUF"];
    const modifiedRegisterArray = [...(await this.getModifiedRegisters())];
    return new Set(modifiedRegisterArray.filter((register) => !nonClobberedRegisters.includes(register)));
  }
}
