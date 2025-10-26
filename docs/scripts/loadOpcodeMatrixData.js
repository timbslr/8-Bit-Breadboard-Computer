import { applyFirstRowStylesByColumn, deleteFirstRow, getTableBodyById } from "./tableUtil.js";
import {
  generateLinkToMnemonic,
  getAmountOfCharOccurrencesInString,
  getInstructions,
  isPSEUDOInstruction,
  REGISTER_LOOKUP,
} from "./util.js";

function createOpcodeMatrixTableCells() {
  const tbody = getTableBodyById("opcode-table");
  for (let rowIndex = 0; rowIndex < 16; rowIndex++) {
    const row = document.createElement("tr");
    for (let colIndex = 0; colIndex < 17; colIndex++) {
      const cell = document.createElement("td");
      if (colIndex == 0) {
        cell.textContent = `${rowIndex.toString(16).toUpperCase()}-`;
        cell.style.minWidth = "30px";
      }
      row.appendChild(cell);
    }
    tbody.appendChild(row);
  }
  applyFirstRowStylesByColumn("opcode-table");
  deleteFirstRow("opcode-table"); //that was the "Loading..." row
}

async function fillOpcodeMatrix() {
  const table = document.getElementById("opcode-table");
  let instructions = await getInstructions();
  const opcodeMap = createOpcodeMap(instructions); //stores all opcodes in binary mapped to their corresponding labels

  for (let i = 0; i < 256; i++) {
    const opcodeBinary = i.toString(2).padStart(8, "0");
    const opcodeHex = i.toString(16).padStart(2, "0").toUpperCase();
    const row = parseInt(opcodeHex[0], 16);
    const col = parseInt(opcodeHex[1], 16);
    const label = opcodeMap[opcodeBinary];
    const currentCell = table.rows[row + 1].cells[col + 1];

    //if the label exists/the opcode is used, put it into the corresponding cell
    if (label) {
      const mnemonic = label.split("<br>")[0];
      const linkTitle = `0x${opcodeHex}: ${mnemonic}`;
      currentCell.innerHTML = generateLinkToMnemonic(mnemonic, label, false, linkTitle);
    }
  }
}

function createOpcodeMap(instructions) {
  const opcodeMap = {};

  instructions.forEach((instruction) => {
    //skip pseudo instructions as they don't have an opcode
    if (isPSEUDOInstruction(instruction.mnemonic, instructions)) {
      return;
    }
    const opcode = instruction.opcode;
    if (opcode.length !== 8) {
      console.error(`Opcode length is not 8: ${opcode}`);
    }

    const registerCount = getAmountOfCharOccurrencesInString(opcode, "R") / 2; //2 bits per register in opcode, registerCount is either 0, 1 or 2

    if (registerCount === 0) {
      opcodeMap[opcode] = instruction.mnemonic;
    } else if (registerCount == 1) {
      let label = instruction.mnemonic;
      for (let i = 0; i < 4; i++) {
        let opcode = `${instruction.opcode.replaceAll("R", "")}${i.toString(2).padStart(2, "0")}`;
        label += `<br>&rarr;${REGISTER_LOOKUP[i]}`;
        opcodeMap[opcode] = label;
        label = instruction.mnemonic; //reset label for next iteration
      }
    } else if (registerCount == 2) {
      let label = instruction.mnemonic;
      for (let i = 0; i < 16; i++) {
        let opcode = `${instruction.opcode.replaceAll("R", "")}${i.toString(2).padStart(4, "0")}`;
        const upperRegisterIndex = (i >> 2) & 0b11;
        const lowerRegisterIndex = i & 0b11;
        label += `<br>${REGISTER_LOOKUP[upperRegisterIndex]}&rarr;${REGISTER_LOOKUP[lowerRegisterIndex]}`;
        opcodeMap[opcode] = label;
        label = instruction.mnemonic;
      }
    } else {
      console.error(
        `Invalid register count! The maximum allowed amount of registers per instruction is 2, but it was ${registerCount}.`
      );
    }
  });

  return opcodeMap;
}

createOpcodeMatrixTableCells();
fillOpcodeMatrix();
