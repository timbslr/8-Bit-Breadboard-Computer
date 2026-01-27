import { Operand, OperandKind } from "./Operand.js";
import Instruction from "./Instruction.js";
import { InstructionInstance } from "./InstructionInstance.js";
import { Example, InstructionGroup, InstructionType, JSONInstruction, MicroInstructions } from "./InstructionTypes.js";
import { Opcode } from "./Opcode.js";
import PSEUDOInstruction from "./PSEUDOInstruction.js";
import REALInstruction from "./REALInstruction.js";

export class InstructionParser {
  private parsedInstructions: Map<string, Instruction> = new Map();
  private mappedJSONInstructions: Map<string, JSONInstruction> = new Map();

  parseJSONInstructions(instructions: JSONInstruction[]): Instruction[] {
    this.parsedInstructions = new Map(); //reset parsed instructions
    this.mappedJSONInstructions = new Map(instructions.map((instr) => [instr.mnemonic, instr])); //reset mapped json-instructions to the new instructions that will be parsed

    instructions.forEach((instr) => {
      if (this.parsedInstructions.get(instr.mnemonic)) {
        return; //skip if already parsed
      }

      const parsedInstr = this.parseJSONInstruction(instr);
      this.parsedInstructions.set(instr.mnemonic, parsedInstr);
    });

    return Array.from(this.parsedInstructions.values()); //TODO return entire Map and save it in DataProvider? --> faster lookup for Instruction from mnemonic? Is it used that often?
  }

  private parseJSONInstruction(instr: JSONInstruction): Instruction {
    const name = instr.name;
    const mnemonic = instr.mnemonic;
    this.validateType(instr.type);
    const type = instr.type === "PSEUDO" ? InstructionType.PSEUDO : InstructionType.REAL;

    this.validateAbstractOperands(instr.operands);
    const abstractOperands = instr.operands.map((operand) => new Operand(operand as OperandKind));

    const group = instr.group as InstructionGroup;
    const indexInGroup = instr.indexInGroup;
    const shortDescription = instr.shortDescription;
    const longDescription = instr.longDescription;
    const examples = instr.examples as Example[];

    if (type === InstructionType.PSEUDO) {
      const mappedInstructionStrings = instr.mappedInstructions as string[];
      const mappedInstructions = mappedInstructionStrings.map((instrString) => {
        const mnemonic = Instruction.extractMnemonicFromInstructionString(instrString);
        let instruction = this.parsedInstructions.get(mnemonic);
        if (instruction) {
          return new InstructionInstance(instruction, instrString); //if this instruction was already parsed, return it
        }

        const jsonInstr = this.mappedJSONInstructions.get(mnemonic);
        if (!jsonInstr) {
          throw new Error(
            `Error during parsing: Instruction "${mnemonic}" references "${mnemonic}" in its mapped instructions, but this instruction does not exist!`,
          );
        }

        const parsedInstr = this.parseJSONInstruction(jsonInstr);
        this.parsedInstructions.set(mnemonic, parsedInstr);
        instruction = this.parsedInstructions.get(mnemonic);

        return new InstructionInstance(instruction as Instruction, instrString);
      });

      return new PSEUDOInstruction({
        name,
        mnemonic,
        type: InstructionType.PSEUDO,
        operands: abstractOperands,
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
      type: InstructionType.REAL,
      operands: abstractOperands,
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
