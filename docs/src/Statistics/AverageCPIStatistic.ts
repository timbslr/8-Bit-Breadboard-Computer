import Instruction from "../Instruction/Instruction.js";
import REALInstruction from "../Instruction/REALInstruction.js";
import { InstructionCountStatistic } from "./InstructionCountStatistic.js";
import { InstructionStatistic } from "./InstructionStatistic.js";

export class AverageCPIStatistic implements InstructionStatistic<number> {
  readonly name = "Average CPI";
  private readonly amountOfREALInstructions;

  constructor(private instructions: Instruction[]) {
    this.amountOfREALInstructions = instructions.filter((instr) => instr instanceof REALInstruction).length; //count only REAL instructions, as PSEUDO-instructions are not part of this statistic
  }

  value(): number {
    return (
      this.instructions
        .filter((instr) => instr instanceof REALInstruction) //don't include PSEUDO-instruction in this statistic
        .reduce((acc, currentInstruction) => acc + this.averageCyclesForInstruction(currentInstruction), 0) / this.amountOfREALInstructions
    );
  }

  private averageCyclesForInstruction(instruction: REALInstruction) {
    const microInstructions = instruction.getMicroinstructions();

    const cyclesIfFlag0 = instruction.requiresFlag()
      ? REALInstruction.countMicroinstructionsWithoutRSC(microInstructions["0"] as string[])
      : REALInstruction.countMicroinstructionsWithoutRSC(microInstructions as string[]);

    const cyclesIfFlag1 = instruction.requiresFlag()
      ? REALInstruction.countMicroinstructionsWithoutRSC(microInstructions["1"] as string[])
      : cyclesIfFlag0;

    return (cyclesIfFlag0 + cyclesIfFlag1) / 2; // the cycles for the current instruction may be different depending on the flag, we take an average to include both values in the result
  }

  formatted(): string {
    const rounded = this.value().toFixed(2);
    return String(rounded);
  }
}
