import REALInstruction from "./REALInstruction.js";
import { AbstractOperand, InstructionGroup, InstructionType, InstructionProperties, Example } from "./InstructionTypes.js";

export const REGISTER_LOOKUP = ["A", "B", "X", "TMP"];
export const LCDREGISTER_LOOKUP = ["CTRL", "DATA"];
export const REGISTER_REGEX = /(PC_L|PC_H|MAR_L|MAR_H|IR|BUF|SP_L|SP_H|A|F|TMP|B|X|7SD)/;

export default abstract class Instruction {
  private name: string;
  private mnemonic: string;
  private type: InstructionType;
  private abstractOperands: AbstractOperand[];
  private group: InstructionGroup;
  private indexInGroup: number;
  private shortDescription: string;
  private longDescription: string;
  private examples: Example[];

  constructor(props: InstructionProperties) {
    this.name = props.name;
    this.mnemonic = props.mnemonic;
    this.type = props.type;
    this.abstractOperands = props.abstractOperands;
    this.group = props.group;
    this.indexInGroup = props.indexInGroup;
    this.shortDescription = props.shortDescription;
    this.longDescription = props.longDescription;
    this.examples = props.examples;
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

  getAbstractOperands(): AbstractOperand[] {
    return this.abstractOperands;
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

  abstract getExecutedInstructions(): REALInstruction[];

  abstract getModifiedRegisters(): Set<string>;

  async getClobberedRegisters() {
    const nonClobberedRegisters = ["PC_L", "PC_H", "MAR_L", "MAR_H", "IR", "SP_L", "SP_H", "F", "7SD", "<reg>", "BUF"];
    const modifiedRegisterArray = [...(await this.getModifiedRegisters())];
    return new Set(modifiedRegisterArray.filter((register) => !nonClobberedRegisters.includes(register)));
  }
}
