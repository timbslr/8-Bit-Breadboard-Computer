import {
  applyFirstRowStylesByColumn,
  attachTableWrapper,
  createRowFromCellContent,
  deleteFirstRow,
} from "./tableUtil.js";
import { countClockCyclesForREALInstruction, extractMnemonicFromInstruction, getInstructions } from "./util.js";

let instructions; //store instructions from json-file globally to make them accessible to other methods

async function createAndFillTables() {
  instructions = await getInstructions();
  instructions = instructions.sort((a, b) => a.mnemonic.localeCompare(b.mnemonic)); //sort in ascending alphabetical order
  const mainContent = document.getElementById("main-content"); //the section for the pages main content

  const templateTable = document.getElementById("template-stats-table"); //the template table which defines layouts

  instructions.forEach((instruction) => {
    const mnemonic = instruction.mnemonic;
    const opcode = instruction.opcode || "-";

    const sizeInROM = calculateSizeInROM(mnemonic);
    let sizeInROMString = `${sizeInROM} Byte`;
    if (sizeInROM !== 1) {
      sizeInROMString += "s"; //s for Bytes
    }

    const numberOfClockCycles = calculateNumberOfClockCycles(mnemonic);
    const numberOfClockCyclesString =
      numberOfClockCycles.zero === numberOfClockCycles.one
        ? numberOfClockCycles.zero
        : `${numberOfClockCycles.zero}/${numberOfClockCycles.one}`;

    const tableId = `${mnemonic}-table`;

    const header = document.createElement("h4");
    header.id = mnemonic;
    header.innerHTML = `${mnemonic} &ndash; ${instruction.name}`;
    mainContent.appendChild(header);

    const lineBreak = document.createElement("br");
    mainContent.appendChild(lineBreak);

    let templateTableCopy = templateTable.cloneNode(true); //true for deep-cloning

    templateTableCopy.id = tableId;

    const cellContents = [instruction.type, instruction.group, opcode, sizeInROMString, numberOfClockCyclesString];
    const contentRow = createRowFromCellContent(cellContents);
    templateTableCopy.appendChild(contentRow);

    templateTableCopy = attachTableWrapper(templateTableCopy);

    mainContent.appendChild(templateTableCopy, lineBreak.nextSibling);

    applyFirstRowStylesByColumn(tableId);
    deleteFirstRow(tableId); //that was the "Loading..." row from the template-table
  });

  templateTable.remove();

  scrollToHeaderIfNecessary(); //scroll header into view if the url contains a hash linking to it
  console.log(calculateSizeInROM("peek"));
}

const operandSizesInBytes = {
  reg: 0,
  regd: 0,
  regs: 0,
  imm: 1,
  addr: 2,
};

function calculateSizeInROM(mnemonic) {
  //rorn and rol have to be handled separately because they have "n" as an argument
  if (mnemonic === "rorn") {
    const sizeInBytes = calculateSizeInROM("ror");
    if (sizeInBytes === 1) {
      return "n";
    }
    return `${sizeInBytes}*n`;
  }
  if (mnemonic === "roln") {
    const sizeInBytes = calculateSizeInROM("rol");
    if (sizeInBytes === 1) {
      return "n";
    }
    return `${sizeInBytes}*n`;
  }

  const instruction = instructions.find((instruction) => instruction.mnemonic === mnemonic);

  if (!instruction) {
    console.error(`Unable to calculate size in ROM for mnemonic "${mnemonic}"`);
    return null;
  }

  let sizeInBytes = 0;

  if (instruction.type === "PSEUDO") {
    instruction.mappedInstructions.forEach((mappedInstruction) => {
      sizeInBytes += calculateSizeInROM(extractMnemonicFromInstruction(mappedInstruction));
    });
    return sizeInBytes;
  }

  sizeInBytes += 1; //each REAL instruction needs at least 1 byte in ROM for the opcode

  instruction.operands.forEach((operand) => {
    const operandSizeInROM = operandSizesInBytes[operand];
    if (operandSizeInROM === undefined) {
      console.error(
        `Found invalid argument "${operand}" during computation of the size in ROM for mnemonic "${mnemonic}"`
      );
      return null;
    }

    sizeInBytes += operandSizeInROM;
  });

  return sizeInBytes;
}

function calculateNumberOfClockCycles(mnemonic) {
  //rorn and rol have to be handled separately because they have "n" as an argument
  if (mnemonic === "rorn") {
    const clockCycles = calculateNumberOfClockCycles("ror");
    return { zero: `${clockCycles.zero}*n`, one: `${clockCycles.one}*n` };
  }
  if (mnemonic === "roln") {
    const clockCycles = calculateNumberOfClockCycles("rol");
    return { zero: `${clockCycles.zero}*n`, one: `${clockCycles.one}*n` };
  }

  const instruction = instructions.find((instruction) => instruction.mnemonic === mnemonic);

  if (!instruction) {
    console.error(`Unable to calculate number of clock cycles for mnemonic "${mnemonic}"`);
    return null;
  }

  let numberOfClockCycles = { zero: 0, one: 0 };

  if (instruction.type === "PSEUDO") {
    instruction.mappedInstructions.forEach((mappedInstruction) => {
      const clockCycles = calculateNumberOfClockCycles(extractMnemonicFromInstruction(mappedInstruction));
      numberOfClockCycles = {
        zero: numberOfClockCycles.zero + clockCycles.zero,
        one: numberOfClockCycles.one + clockCycles.one,
      };
    });
    return numberOfClockCycles;
  }

  const clockCycles = countClockCyclesForREALInstruction(instruction);
  numberOfClockCycles = {
    zero: numberOfClockCycles.zero + clockCycles.zero,
    one: numberOfClockCycles.one + clockCycles.one,
  };

  return numberOfClockCycles;
}

function scrollToHeaderIfNecessary() {
  const headerLinkFromURL = window.location.hash;
  if (!headerLinkFromURL) return;

  const headerId = headerLinkFromURL.replace("#", "");
  const targetHeader = document.getElementById(headerId);
  if (!targetHeader) return;

  targetHeader.scrollIntoView({ behavior: "instant" });

  //highlight header for 1 second
  targetHeader.classList.add("highlightedHeader");
  setTimeout(() => {
    targetHeader.classList.remove("highlightedHeader");
  }, 1000);
}

createAndFillTables();
window.addEventListener("hashchange", scrollToHeaderIfNecessary); //if the hash linking to a header changed
