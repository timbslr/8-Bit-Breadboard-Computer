import Instruction from "./Instruction.js";
import InstructionRepository from "./InstructionRepository.js";

type ClockCyclesObject = { flagLow: number; flagHigh: number };

export default class Formatter {
  static formatNumberOfClockCyclesString(numberOfClockCyclesObject: ClockCyclesObject): string {
    const clockCycles = numberOfClockCyclesObject;
    let flagLowString = String(clockCycles.flagLow);
    let flagHighString = String(clockCycles.flagHigh);

    if (clockCycles.flagLow > clockCycles.flagHigh) {
      //the smaller clock cycle count should be displayed first, followed by the bigger one if they are not equal
      [flagLowString, flagHighString] = [flagHighString, flagLowString];
    }

    return flagLowString === flagHighString ? flagLowString : `${flagLowString}/${flagHighString}`;
  }

  static formatClobberedRegisters(clobberedRegisters: Set<string>): string {
    const formattedString = [...clobberedRegisters].map((entry) => Formatter.escapeHTML(entry)).join(",<br>");
    return formattedString === "" ? "-" : formattedString;
  }

  static escapeHTML(text: string): string {
    const replacements = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\n": "<br>",
    };

    return Object.entries(replacements).reduce((replacedText, [key, value]) => replacedText.replaceAll(key, value), text);
  }

  static appendHTMLBar(text: string) {
    return `<span style="text-decoration: overline;"> ${text} </span>`;
  }

  static decorateTextWithLink(text: string, redirectLink: string, linkTitle?: string) {
    const title = linkTitle ? `title="${linkTitle}` : "";
    return `<a href="${redirectLink}" ${title}">${text}</a>`;
  }

  static joinMnemonicWithOperands(mnemonic: string, operands: string[]) {
    return `${mnemonic} ${operands.map((operand) => `<${operand}>`).join(", ")}`;
  }

  static async joinAndDecorateMappedInstructionsWithLink(mappedInstructions: string[], lineDelimiter = "<br>") {
    const decoratedInstructions = await Promise.all(
      mappedInstructions.map(async (instruction) => {
        instruction = Formatter.escapeHTML(instruction);
        const mnemonic = Instruction.extractMnemonicFromInstructionString(instruction);
        //if the mnemonic is valid, add a link to it
        if (await InstructionRepository.isMnemonicValid(mnemonic)) {
          instruction = instruction.replace(mnemonic, Formatter.decorateTextWithLink(mnemonic, `./details#${mnemonic}`));
        }

        return instruction;
      })
    );

    return decoratedInstructions.join(lineDelimiter);
  }

  static formatOriginListWithLinks(originList: Set<string>) {
    const listItems = Array.from(originList).map((entry) => "<li>" + entry.replace(".csv", "") + "</li>");
    return `<ul> ${listItems.join(" ")} </ul>`;
  }
}
