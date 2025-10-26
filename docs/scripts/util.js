export const REGISTER_LOOKUP = ["A", "B", "X", "T"];

export async function getInstructions() {
  const response = await fetch("../resources/data/instructionData.json");
  const data = await response.json();
  return data.instructions;
}

export async function getControlBits() {
  const response = await fetch("./resources/data/controlBits.json");
  const data = await response.json();
  return data.controlBits;
}

export function getAmountOfCharOccurrencesInString(string, char) {
  return [...string].filter((c) => c === char).length;
}

export function generateLinkToMnemonic(mnemonic, label, isPSEUDOInstruction, title = undefined) {
  const titleInsert = title ? `title="${title}` : "";
  return `<a href="./details#${mnemonic}" ${titleInsert}">${label}</a>`;
}

export function extractMnemonicFromInstruction(instruction) {
  return instruction.split(" ")[0];
}

export function escapeHTML(string) {
  return string.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\n", "<br>");
}

export function joinMnemonicAndOperands(mnemonic, operands) {
  return `${mnemonic} ${operands.map((operand) => `<${operand}>`).join(", ")}`;
}

export function joinMappedInstructionsWithLink(mappedInstructions, instructions) {
  return mappedInstructions
    .map((instruction) => {
      instruction = escapeHTML(instruction);
      const mnemonic = extractMnemonicFromInstruction(instruction);
      //if the mnemonic is valid, add a link to it
      if (isMnemonicValid(mnemonic, instructions)) {
        instruction = instruction.replace(mnemonic, generateLinkToMnemonic(mnemonic, mnemonic, false));
      }

      return instruction;
    })
    .join("<br>");
}

export function isMnemonicValid(mnemonic, instructions) {
  return getInstructionByMnemonic(mnemonic, instructions) !== undefined;
}

export function getInstructionByMnemonic(mnemonic, instructions) {
  return instructions.find((instruction) => instruction.mnemonic === mnemonic);
}

export function isPSEUDOInstruction(mnemonic, instructions) {
  return getInstructionByMnemonic(mnemonic, instructions).type === "PSEUDO";
}

export function countClockCyclesForREALInstruction(instruction) {
  let zeroMicroinstructions;
  let oneMicroinstructions;
  if (instruction.requiresFlag) {
    zeroMicroinstructions = instruction.microinstructions["0"];
    oneMicroinstructions = instruction.microinstructions["1"];
  } else {
    zeroMicroinstructions = instruction.microinstructions;
    oneMicroinstructions = instruction.microinstructions;
  }

  return {
    zero: countMicroinstructionsWithoutRSC(zeroMicroinstructions),
    one: countMicroinstructionsWithoutRSC(oneMicroinstructions),
  };
}

function countMicroinstructionsWithoutRSC(microinstructions) {
  const length = microinstructions.length;
  if (microinstructions[length - 1].includes("RSC")) {
    return length - 1;
  }
  return length;
}
