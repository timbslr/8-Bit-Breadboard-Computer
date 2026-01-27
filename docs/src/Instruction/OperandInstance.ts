import { Operand, OperandKind } from "./Operand.js";

export class OperandInstance extends Operand {
  private readonly value: string;
  constructor(name: OperandKind, value: string) {
    super(name);
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }
}
