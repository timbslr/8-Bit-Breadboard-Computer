import Instruction from "../Instruction/Instruction.js";
import PSEUDOInstruction from "../Instruction/PSEUDOInstruction.js";
import REALInstruction from "../Instruction/REALInstruction.js";
import { InstructionStatistic } from "./InstructionStatistic.js";

type FlagDependentNumber = { flagLow: number; flagHigh: number };

export class InstructionClockCyclesStatistic implements InstructionStatistic<FlagDependentNumber> {
  readonly name = "Clock Cycles per Execution";

  constructor(private instruction: Instruction) {}

  value(): FlagDependentNumber {
    if (this.instruction.isPSEUDO()) {
      return this.valueForPSEUDOInstruction();
    }

    return this.valueForREALInstruction();
  }

  private valueForPSEUDOInstruction(): FlagDependentNumber {
    let numberOfClockCycles = { flagLow: 0, flagHigh: 0 }; //may differ if flag is low or high

    for (const mappedInstruction of (this.instruction as PSEUDOInstruction).getMappedInstructions()) {
      const stat = new InstructionClockCyclesStatistic(mappedInstruction.getDefinition());
      const clockCyclesForMappedInstruction = stat.value();
      numberOfClockCycles = {
        flagLow: numberOfClockCycles.flagLow + clockCyclesForMappedInstruction.flagLow,
        flagHigh: numberOfClockCycles.flagHigh + clockCyclesForMappedInstruction.flagHigh,
      };
    }

    return numberOfClockCycles;
  }

  private valueForREALInstruction(): FlagDependentNumber {
    const microinstructions = (this.instruction as REALInstruction).getMicroinstructions();

    const [low, high] = (this.instruction as REALInstruction).requiresFlag()
      ? [microinstructions["0"] as string[], microinstructions["1"] as string[]]
      : [microinstructions as string[], microinstructions as string[]];

    return {
      flagLow: REALInstruction.countMicroinstructionsWithoutRSC(low),
      flagHigh: REALInstruction.countMicroinstructionsWithoutRSC(high),
    };
  }

  formatted(): string {
    const clockCycles = this.value();
    let low = clockCycles.flagLow;
    let high = clockCycles.flagHigh;

    if (low > high) {
      //the smaller clock cycle count should be displayed first, followed by the bigger one if they are not equal
      [low, high] = [high, low];
    }

    return low === high ? String(low) : `${low}/${high}`;
  }
}
