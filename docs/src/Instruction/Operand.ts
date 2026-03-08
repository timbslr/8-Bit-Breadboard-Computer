export type OperandKind = "reg" | "regd" | "regs" | "lcdreg" | "imm" | "addr";

const sizesInMemory = {
  reg: 0,
  regd: 0,
  regs: 0,
  lcdreg: 0,
  imm: 1,
  addr: 2,
};

export class Operand {
  constructor(private name: OperandKind) {}

  sizeInMemory() {
    return sizesInMemory[this.name];
  }

  getName(): OperandKind {
    return this.name;
  }
}
