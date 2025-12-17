export type JSONInstruction = {
  name: string;
  mnemonic: string;
  type: InstructionType;
  operands: string[];
  requiresFlag?: boolean;
  opcode?: string;
  microinstructions?: MicroInstructions;
  mappedInstructions?: string[];
  group: string;
  indexInGroup: number;
  shortDescription: string;
  longDescription: string;
  examples: Example[];
};

export type InstructionType = "REAL" | "PSEUDO";

export type MicroInstructions = string[] | { "0": string[]; "1": string[] };

type Example = {
  prerequisites: { register: Register; value: number }[];
  code: string[];
  result: { register: Register; value: number }[];
};

type Register =
  | "PC_L"
  | "PC_H"
  | "MAR_L"
  | "MAR_H"
  | "IR"
  | "BUF"
  | "SP_L"
  | "SP_H"
  | "A"
  | "F"
  | "TMP"
  | "B"
  | "X"
  | "7SD";
