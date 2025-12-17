import Instruction from "./Instruction.js";
import Statistics from "./Statistics.js";

export default class REALInstruction extends Instruction {
  #opcode;
  #microInstructions;

  constructor(instructionJSONObject) {
    super(instructionJSONObject);
    if (super.isPSEUDO()) {
      throw new TypeError("Instruction is not of type REAL");
    }

    this.#opcode = instructionJSONObject.opcode;
    this.#microInstructions = instructionJSONObject.microinstructions;
  }

  /**
   * @returns {string[]}
   */
  getMicroinstructions() {
    return this.#microInstructions;
  }

  /**
   * @returns {string}
   */
  getOpcode() {
    return this.#opcode;
  }

  async getModifiedRegisters() {
    const executedInstructions = await this.getExecutedInstructions();
    const modifiedRegisters = new Set();
    for (const executedInstruction of executedInstructions) {
      let microinstructions = executedInstruction.getMicroinstructions();
      if (typeof microinstructions === "object") {
        //if true, its an instruction with requiresFlag: true, thus it contains the properties "0" and "1"
        microinstructions = microinstructions["0"].concat(microinstructions["1"]);
      }

      for (const microinstruction of microinstructions) {
        for (const controlString of microinstruction) {
          let match;
          if ((match = /IE_(.*)|li (\w+),/.exec(controlString))) {
            modifiedRegisters.add(match[1]);
          }
        }
      }
    }

    return modifiedRegisters;
  }

  async getExecutedInstructions() {
    return [this];
  }

  async getAmountOfClockCyclesPerExecution() {
    const microinstructions = this.getMicroinstructions();
    let flagLowMicroinstructions;
    let flagHighMicroinstructions;
    if (this.requiresFlag()) {
      flagLowMicroinstructions = microinstructions["0"];
      flagHighMicroinstructions = microinstructions["1"];
    } else {
      flagLowMicroinstructions = microinstructions;
      flagHighMicroinstructions = microinstructions;
    }

    return {
      flagLow: Statistics.countMicroinstructionsWithoutRSC(flagLowMicroinstructions),
      flagHigh: Statistics.countMicroinstructionsWithoutRSC(flagHighMicroinstructions),
    };
  }
}
