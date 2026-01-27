import { OnlyRequired } from "../types/Helper.js";
import { Operand } from "./Operand.js";
import { InstructionInstance } from "./InstructionInstance.js";
import { Opcode } from "./Opcode.js";

export type JSONInstruction = {
  name: string;
  mnemonic: string;
  type: string;
  operands: string[];
  requiresFlag?: boolean;
  opcode?: string;
  microinstructions?: MicroInstructions;
  mappedInstructions?: string[];
  group: string;
  indexInGroup: number;
  shortDescription: string;
  longDescription: string;
  examples: object[];
};

export type InstructionProperties = Omit<JSONInstruction, "type" | "operands" | "opcode" | "mappedInstructions" | "group" | "examples"> & {
  type: InstructionType;
  operands: Operand[];
  opcode?: Opcode;
  mappedInstructions?: InstructionInstance[];
  group: InstructionGroup;
  examples: Example[];
};

export type REALInstructionProperties = Required<
  OnlyRequired<InstructionProperties> & Pick<InstructionProperties, "requiresFlag" | "opcode" | "microinstructions">
> & { type: InstructionType.REAL };

export type PSEUDOInstructionProperties = Required<OnlyRequired<InstructionProperties> & Pick<InstructionProperties, "mappedInstructions">> & {
  type: InstructionType.PSEUDO;
};

export type Example = {
  prerequisites: RegisterState[];
  code: InstructionInstance[];
  result: RegisterState[];
};

export enum InstructionType {
  REAL,
  PSEUDO,
}

export type MicroInstructions = string[] | { "0": string[]; "1": string[] };
export type InstructionGroup = "ALU" | "REG-MEM" | "I-O" | "SYS" | "BR-JMP";

export type Register = "PC_L" | "PC_H" | "MAR_L" | "MAR_H" | "IR" | "BUF" | "SP_L" | "SP_H" | "A" | "F" | "TMP" | "B" | "X" | "7SD";
export type LCDInternalRegister = "CTRL" | "DATA";
export type RegisterState = { register: Register; value: number };
