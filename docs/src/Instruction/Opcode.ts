type Range = { lower: number; upper: number };

export class Opcode {
  private readonly originalString: string;
  private readonly range: Range;

  constructor(opcodeString: string) {
    this.originalString = opcodeString;

    const lower_string = opcodeString.replace(/[^01]/g, "0");
    const upper_string = opcodeString.replace(/[^01]/g, "0");
    this.range = { lower: parseInt(lower_string, 2), upper: parseInt(upper_string, 2) };
  }

  getOriginalString() {
    return this.originalString;
  }

  getRange(): Range {
    return this.range;
  }

  opcodesInsideRange(): number[] {
    const { lower, upper } = this.getRange();
    return Array.from({ length: upper - lower + 1 }, (_, i) => lower + i);
  }

  amountOfCoveredOpcodes() {
    return this.range.upper - this.range.lower;
  }
}
