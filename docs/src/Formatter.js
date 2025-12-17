import Instruction from "./Instruction.js";
import InstructionRepository from "./InstructionRepository.js";

export default class Formatter {
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

  static formatClobberedRegisters(clobberedRegisters) {
    const formattedString = [...clobberedRegisters].map((entry) => Formatter.escapeHTML(entry)).join(",<br>");
    return formattedString === "" ? "-" : formattedString;
  }

  static escapeHTML(string) {
    return string.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\n", "<br>");
  }

  static appendHTMLBar(string) {
    return `<span style="text-decoration: overline;"> ${string} </span>`;
  }

  static decorateMnemonicWithLink(mnemonic, linkLabel = undefined, linkTitle = undefined, redirectLink = undefined) {
    const label = linkLabel || mnemonic;
    const title = linkTitle ? `title="${linkTitle}` : "";
    const link = redirectLink || `./details#${mnemonic}`;
    return `<a href="${link}" ${title}">${label}</a>`;
  }

  static joinMnemonicWithOperands(mnemonic, operands) {
    return `${mnemonic} ${operands.map((operand) => `<${operand}>`).join(", ")}`;
  }

  static async joinAndDecorateMappedInstructionsWithLink(mappedInstructions, lineDelimiter = "<br>") {
    const decoratedInstructions = await Promise.all(
      mappedInstructions.map(async (instruction) => {
        instruction = Formatter.escapeHTML(instruction);
        const mnemonic = Instruction.extractMnemonicFromInstructionString(instruction);
        //if the mnemonic is valid, add a link to it
        if (await InstructionRepository.isMnemonicValid(mnemonic)) {
          instruction = instruction.replace(mnemonic, Formatter.decorateMnemonicWithLink(mnemonic, mnemonic, false));
        }

        return instruction;
      })
    );

    return decoratedInstructions.join(lineDelimiter);
  }
}
