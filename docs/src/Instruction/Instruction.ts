import REALInstruction from "./REALInstruction.js";
import { InstructionGroup, InstructionType, InstructionProperties, Example } from "./InstructionTypes.js";
import { Operand } from "./Operand.js";

export const REGISTER_LOOKUP = ["A", "B", "X", "TMP"];
export const LCDREGISTER_LOOKUP = ["CTRL", "DATA"];
export const REGISTER_REGEX = /(PC_L|PC_H|MAR_L|MAR_H|IR|BUF|SP_L|SP_H|A|F|TMP|B|X|7SD)/;

export default abstract class Instruction {
  private name: string;
  private mnemonic: string;
  private type: InstructionType;
  private operands: Operand[];
  private group: InstructionGroup;
  private indexInGroup: number;
  private shortDescription: string;
  private longDescription: string;
  private examples: Example[];

  constructor(props: InstructionProperties) {
    this.name = props.name;
    this.mnemonic = props.mnemonic;
    this.type = props.type;
    this.operands = props.operands;
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
    return this.type === InstructionType.PSEUDO;
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

  getExamples(): Example[] {
    return this.examples;
  }

  static extractMnemonicFromInstructionString(instructionString: string) {
    return instructionString.split(" ")[0].trim();
  }

  static extractOperandsFromInstructionString(instructionString: string) {
    const parts = instructionString.split(/ (.+)/); //split at first space (between the mnemonic and the first operand)
    if (parts.length < 2) {
      return []; //no operands present
    }

    return parts[1]
      .split(",")
      .map((operand) => operand.trim())
      .filter((operand) => operand !== ""); //remove empty strings if there are any
  }

  abstract getExecutedInstructions(): REALInstruction[];

  abstract getModifiedRegisters(): Set<string>;

  getClobberedRegisters() {
    const nonClobberedRegisters = ["PC_L", "PC_H", "MAR_L", "MAR_H", "IR", "SP_L", "SP_H", "F", "7SD", "<reg>", "BUF"];
    const modifiedRegisterArray = [...this.getModifiedRegisters()];
    return new Set(modifiedRegisterArray.filter((register) => !nonClobberedRegisters.includes(register)));
  }
}
