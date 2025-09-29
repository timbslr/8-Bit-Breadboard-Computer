import {
  applyFirstRowStylesByColumn,
  deleteFirstRow,
  getAmountOfCharOccurrencesInString,
  getInstructions,
  getTableBodyByID,
  REGISTER_LOOKUP,
} from "./util.js";

function createOpcodeMatrixTableCells() {
  const tbody = getTableBodyByID("opcode-table");
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
  deleteFirstRow("opcode-table");
}

async function fillOpcodeMatrix() {
  const opcodeMap = {};
  let instructions = await getInstructions();
  instructions.forEach((instruction) => {
    if (instruction.type === "PSEUDO") {
      //skip pseudo instructions as they don't have an opcode
      return;
    }
    const opcode = instruction.opcode;
    if (!opcode) {
      console.error(`Invalid opcode: ${opcode}`);
      return;
    }

    const registerCount = getAmountOfCharOccurrencesInString(opcode, "R") / 2; //2 bits per register in opcode, registerCount is either 0, 1 or 2

    if (registerCount === 0) {
      opcodeMap[opcode] = instruction.mnemonic;
    } else if (registerCount == 1) {
      let label = instruction.mnemonic;
      for (let i = 0; i < 4; i++) {
        let opcode = `${instruction.opcode.replaceAll("R", "")}${i.toString(2).padStart(2, "0")}`;
        if (opcode.length !== 8) {
          console.error(`Opcode length is not 8: ${opcode}`);
        }
        label += ` &rarr;${REGISTER_LOOKUP[i]}`;
        opcodeMap[opcode] = label;
        label = instruction.mnemonic;
      }
    } else if (registerCount == 2) {
      let label = instruction.mnemonic;
      for (let i = 0; i < 16; i++) {
        let opcode = `${instruction.opcode.replaceAll("R", "")}${i.toString(2).padStart(4, "0")}`;
        if (opcode.length !== 8) {
          console.error(`Opcode length is not 8: ${opcode}`);
        }
        const upperRegisterIndex = (i >> 2) & 0b11;
        const lowerRegisterIndex = i & 0b11;
        label += ` ${REGISTER_LOOKUP[upperRegisterIndex]}&rarr;${REGISTER_LOOKUP[lowerRegisterIndex]}`;
        opcodeMap[opcode] = label;
        label = instruction.mnemonic;
      }
    } else {
      console.error(
        `Invalid register count! The maximum allowed amount of registers per instruction is 2, but it was ${registerCount}.`
      );
    }
  });

  addEntriesToOpcodeMatrix(opcodeMap);
}

function addEntriesToOpcodeMatrix(opcodeMap) {
  const table = document.getElementById("opcode-table");
  for (let i = 0; i < 256; i++) {
    const opcodeBinary = i.toString(2).padStart(8, "0");
    const opcodeHex = i.toString(16).padStart(2, "0").toUpperCase();
    const row = parseInt(opcodeHex[0], 16);
    const col = parseInt(opcodeHex[1], 16);
    const label = opcodeMap[opcodeBinary];
    const currentCell = table.rows[row + 1].cells[col + 1];
    //
    if (label) {
      //if the label exists/the opcode is actually used
      currentCell.innerHTML = `<a href="" title="0x${opcodeHex}: ${label}">${label}</a>`;
    }
  }
}

createOpcodeMatrixTableCells();
fillOpcodeMatrix();
