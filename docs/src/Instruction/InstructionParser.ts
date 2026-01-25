import Instruction from "./Instruction.js";
import { InstructionInstance } from "./InstructionInstance.js";
import { AbstractOperand, Example, InstructionGroup, InstructionType, JSONInstruction, MicroInstructions } from "./InstructionTypes.js";
import { Opcode } from "./Opcode.js";
import PSEUDOInstruction from "./PSEUDOInstruction.js";
import REALInstruction from "./REALInstruction.js";

export class InstructionParser {
  private parsedInstructions: Map<string, Instruction> = new Map();
  private mappedJSONInstructions: Map<string, JSONInstruction> = new Map();

  parseJSONInstructions(instructions: JSONInstruction[]): Instruction[] {
    this.parsedInstructions = new Map();
    this.mappedJSONInstructions = new Map(instructions.map((instr) => [instr.mnemonic, instr]));

    const { realJSONInstructions, pseudoJSONInstructions } = this.sortInstructionsByType(instructions);

    //parse REAL instructions first as they are safe to parse (no dependencies to other instructions by mappedInstructions)
    realJSONInstructions.forEach((realInstruction) => {
      this.parsedInstructions.set(realInstruction.mnemonic, this.parseJSONInstruction(realInstruction));
    });

    pseudoJSONInstructions.forEach((pseudoInstruction) => {
      if (this.parsedInstructions.get(pseudoInstruction.mnemonic)) {
        return; //skip if already parsed
      }

      this.parsedInstructions.set(pseudoInstruction.mnemonic, this.parseJSONInstruction(pseudoInstruction));
    });

    return Array.from(this.parsedInstructions.values()); //TODO return entire Map and save it in DataProvider? --> faster lookup for Instruction from mnemonic? It it used that often?
  }

  private sortInstructionsByType(instructions: JSONInstruction[]): {
    realJSONInstructions: JSONInstruction[];
    pseudoJSONInstructions: JSONInstruction[];
  } {
    const realJSONInstructions = [];
    const pseudoJSONInstructions = [];

    for (const jsonInstruction of instructions) {
      jsonInstruction.type === "PSEUDO" ? pseudoJSONInstructions.push(jsonInstruction) : realJSONInstructions.push(jsonInstruction);
    }

    return { realJSONInstructions, pseudoJSONInstructions };
  }

  private parseJSONInstruction(instr: JSONInstruction): Instruction {
    const name = instr.name;
    const mnemonic = instr.mnemonic;
    this.validateType(instr.type);
    const type = instr.type as InstructionType;

    this.validateAbstractOperands(instr.operands);
    const abstractOperands = instr.operands as AbstractOperand[];

    const group = instr.group as InstructionGroup;
    const indexInGroup = instr.indexInGroup;
    const shortDescription = instr.shortDescription;
    const longDescription = instr.longDescription;
    const examples = instr.examples as Example[];

    if (type === "PSEUDO") {
      const mappedInstructionStrings = instr.mappedInstructions as string[];
      const mappedInstructions = mappedInstructionStrings.map((instrString) => {
        const mnemonic = Instruction.extractMnemonicFromInstructionString(instrString);
        let instruction = this.parsedInstructions.get(mnemonic);
        if (instruction) {
          return new InstructionInstance(instruction, instrString); //if this instruction was already parsed, return it
        }

        const jsonInstruction = this.mappedJSONInstructions.get(mnemonic);
        if (!jsonInstruction) {
          throw new Error(
            `Error during parsing: Instruction "${mnemonic}" references "${mnemonic}" in its mapped instructions, but this instruction does not exist!`,
          );
        }
        this.parsedInstructions.set(mnemonic, this.parseJSONInstruction(jsonInstruction));
        instruction = this.parsedInstructions.get(mnemonic);
        if (!instruction) {
          throw new Error("Something went wrong during parsing of the instructions!");
        }

        return new InstructionInstance(instruction, instrString);
      });

      return new PSEUDOInstruction({
        name,
        mnemonic,
        type: "PSEUDO",
        abstractOperands,
        group,
        indexInGroup,
        shortDescription,
        longDescription,
        examples,
        mappedInstructions,
      });
    }

    const requiresFlag = instr.requiresFlag as boolean;
    const opcode = new Opcode(instr.opcode as string);
    const microinstructions = instr.microinstructions as MicroInstructions;

    return new REALInstruction({
      name,
      mnemonic,
      type: "REAL",
      abstractOperands,
      group,
      indexInGroup,
      shortDescription,
      longDescription,
      examples,
      requiresFlag,
      opcode,
      microinstructions,
    });
  }

  private validateType(type: string) {
    if (type !== "PSEUDO" && type !== "REAL") {
      throw new Error(`Invalid type: ${type}`);
    }
  }

  private validateAbstractOperands(operands: string[]) {
    const validOperands = ["reg", "regd", "regs", "regsd", "regss", "lcdreg", "imm", "addr"]; //TODO unite with InstructionTypes file
    operands.forEach((operand) => {
      if (!validOperands.includes(operand)) {
        throw new Error(`Invalid abstract operand: ${operand}`);
      }
    });
  }
}
