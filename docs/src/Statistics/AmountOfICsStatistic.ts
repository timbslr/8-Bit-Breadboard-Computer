import Instruction from "../Instruction/Instruction.js";
import REALInstruction from "../Instruction/REALInstruction.js";
import { Component } from "../Parser/ComponentParser.js";
import { InstructionCountStatistic } from "./InstructionCountStatistic.js";
import { Statistic } from "./Statistic.js";

export class AmountOfICsStatistic implements Statistic<number> {
  readonly name = "Average CPI";

  constructor(private components: Map<Component, number>) {}

  value(): number {
    let totalAmount = 0;
    for (const [component, quantity] of this.components.entries()) {
      if (!component.type.startsWith("IC")) {
        continue; //skip components that are not ICs
      }
      totalAmount += quantity;
    }

    return totalAmount;
  }

  formatted(): string {
    return String(this.value());
  }
}
