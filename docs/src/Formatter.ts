import Instruction from "./Instruction/Instruction.js";
import InstructionRepository from "./Instruction/InstructionRepository.js";

const csvNameToMarkdownName = new Map<string, string>([
  ["7-Segment Display", "7-segment-display"],
  ["A-Register", "a-register"],
  ["ALU", "arithmetic-logic-unit"],
  ["B-Register", "b-c-registers"],
  ["BUF-Register", "buffer-register"],
  ["C-Register", "b-c-registers"],
  ["Clock", "clock"],
  ["Controller", "controller"],
  ["Flags-Register", "flags-register"],
  ["IR", "instruction-register"],
  ["LCD", "liquid-crystal-display"],
  ["MAR", "memory-address-register"],
  ["Memory", "memory"],
  ["PC", "program-counter"],
  ["Reset", "reset"],
  ["Serial Interface", "serial-interface"],
  ["SP", "stack-pointer"],
  ["TMP-Register", "tmp-register"],
  ["X-Register", "x-y-registers"],
  ["Y-Register", "x-y-registers"],
]);
export default class Formatter {
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
      }),
    );

    return decoratedInstructions.join(lineDelimiter);
  }

  static formatOriginListWithLinks(originList: Set<string>) {
    const listItems = Array.from(originList).map((entry) => {
      const entryFileName = entry.replace(".csv", "");
      const markdownFileName = csvNameToMarkdownName.get(entryFileName);
      if (markdownFileName) {
        return `<li> <a href="./modules/${markdownFileName}"> ${entryFileName} </a> </li>`;
      }
      return `<li> ${entryFileName} </li>`;
    });

    return `<ul> ${listItems.join(" ")} </ul>`;
  }
}
