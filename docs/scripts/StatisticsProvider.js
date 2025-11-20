import InstructionsUtilProvider from "./InstructionsUtilProvider.js";

export default class StatisticsProvider {
  static #operandSizesInBytes = {
    reg: 0,
    regd: 0,
    regs: 0,
    regsd: 0,
    regss: 0,
    lcdreg: 0,
    imm: 1,
    addr: 2,
  };

  static countCharsInString(string, char) {
    return [...string].filter((c) => c === char).length;
  }

  static async getByteSizeInROM(mnemonic) {
    //rorn and rol have to be handled separately because they have "n" as an argument
    if (mnemonic === "rorn") {
      const sizeInBytes = await this.getByteSizeInROM("ror");
      return sizeInBytes === 1 ? "n" : `${sizeInBytes}*n`;
    }
    if (mnemonic === "roln") {
      const sizeInBytes = await this.getByteSizeInROM("rol");
      return sizeInBytes === 1 ? "n" : `${sizeInBytes}*n`;
    }

    let byteSizeInROM = 0;
    const instruction = await InstructionsUtilProvider.getInstructionObjectByMnemonic(mnemonic);
    const isPSEUDOInstruction = await InstructionsUtilProvider.isPSEUDOInstruction(mnemonic);

    if (isPSEUDOInstruction) {
      for (const mappedInstruction of instruction.mappedInstructions) {
        const mnemonic = InstructionsUtilProvider.extractMnemonicFromInstructionString(mappedInstruction);
        byteSizeInROM += await this.getByteSizeInROM(mnemonic);
      }
      return byteSizeInROM;
    }

    byteSizeInROM = 1; //each REAL instruction needs at least 1 byte in ROM for the opcode

    instruction.operands.forEach((operand) => {
      const operandsSizeInROM = this.#operandSizesInBytes[operand];
      if (operandsSizeInROM === undefined) {
        console.error(
          `Found invalid operand "${operand}" during computation of the size in ROM for mnemonic "${mnemonic}"`
        );
        return null;
      }

      byteSizeInROM += operandsSizeInROM;
    });

    return byteSizeInROM;
  }

  static async getAmountOfClockCyclesPerExecution(mnemonic) {
    //rorn and rol have to be handled separately because they have "n" as an argument
    if (mnemonic === "rorn" || mnemonic == "roln") {
      const clockCycles = await this.getAmountOfClockCyclesPerExecution(mnemonic.replace("n", ""));
      return { flagLow: `${clockCycles.flagLow}*n`, flagHigh: `${clockCycles.flagHigh}*n` };
    }

    const instruction = await InstructionsUtilProvider.getInstructionObjectByMnemonic(mnemonic);
    const isPSEUDOInstruction = await InstructionsUtilProvider.isPSEUDOInstruction(mnemonic);
    if (isPSEUDOInstruction) {
      let numberOfClockCycles = { flagLow: 0, flagHigh: 0 }; //may differ if flag is low or high

      for (const instructionString of instruction.mappedInstructions) {
        const mnemonic = InstructionsUtilProvider.extractMnemonicFromInstructionString(instructionString);
        const clockCyclesForMappedInstruction = await this.getAmountOfClockCyclesPerExecution(mnemonic);
        numberOfClockCycles = {
          flagLow: numberOfClockCycles.flagLow + clockCyclesForMappedInstruction.flagLow,
          flagHigh: numberOfClockCycles.flagHigh + clockCyclesForMappedInstruction.flagHigh,
        };
      }

      return numberOfClockCycles;
    }

    return this.#countClockCyclesForREALInstruction(instruction);
  }

  static #countClockCyclesForREALInstruction(instructionObject) {
    let flagLowMicroinstructions;
    let flagHighMicroinstructions;
    if (instructionObject.requiresFlag) {
      flagLowMicroinstructions = instructionObject.microinstructions["0"];
      flagHighMicroinstructions = instructionObject.microinstructions["1"];
    } else {
      flagLowMicroinstructions = instructionObject.microinstructions;
      flagHighMicroinstructions = instructionObject.microinstructions;
    }

    return {
      flagLow: this.#countMicroinstructionsWithoutRSC(flagLowMicroinstructions),
      flagHigh: this.#countMicroinstructionsWithoutRSC(flagHighMicroinstructions),
    };
  }

  static #countMicroinstructionsWithoutRSC(microinstructionsArray) {
    const length = microinstructionsArray.length;
    if (microinstructionsArray[length - 1].includes("RSC")) {
      return length - 1;
    }
    return length;
  }

  static formatNumberOfClockCyclesString(numberOfClockCyclesObject) {
    const clockCycles = numberOfClockCyclesObject;
    if (clockCycles.flagLow > clockCycles.flagHigh) {
      //the smaller clock cycle count should be displayed first, followed by the bigger one if they are not equal
      [clockCycles.flagLow, clockCycles.flagHigh] = [clockCycles.flagHigh, clockCycles.flagLow];
    }

    return clockCycles.flagLow === clockCycles.flagHigh
      ? clockCycles.flagLow
      : `${clockCycles.flagLow}/${clockCycles.flagHigh}`;
  }
}
