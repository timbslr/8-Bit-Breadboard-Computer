import { LCDREGISTER_LOOKUP, REGISTER_LOOKUP } from "../Instruction.js";
import Statistics from "../Statistics.js";
import TableBuilder from "../TableBuilder.js";
import DataProvider from "../DataProvider.js";
import Formatter from "../Formatter.js";

function createOpcodeMatrixTableCells() {
  const placeholder = document.getElementById("placeholder-opcode-table");

  //create an empty table which only contains the opcode nibbles for description, the instructions will be added in another method
  const table = new TableBuilder()
    .headers(["", "-0", "-1", "-2", "-3", "-4", "-5", "-6", "-7", "-8", "-9", "-A", "-B", "-C", "-D", "-E", "-F"])
    .addRows(
      Array(16)
        .fill("") //turn sparse array into an actual array, otherwise .map() doesn't behave as expected
        .map((_, index) => [`${index.toString(16).toUpperCase()}-`, ...Array(16).fill("")]) //creates 16 rows, each has an opcode nibble followed by 16 empty cells
    )
    .firstColumnMinWidth("30px")
    .id("opcode-table")
    .textAlign(Array(17).fill("center"))
    .build();

  placeholder.parentNode.insertBefore(table, placeholder);
  placeholder.remove();
}

async function fillOpcodeMatrix() {
  const table = document.getElementById("opcode-table");
  const opcodeMap = await createOpcodeMap(); //stores all opcodes in binary mapped to their corresponding labels

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
      let linkTitle = `0x${opcodeHex}: ${label}`.replace("<br>", " "); //replace <br> between mnemonic and arguments with space
      linkTitle = linkTitle.replaceAll("<br>", ""); //remove all <br> that are left
      currentCell.innerHTML = Formatter.decorateMnemonicWithLink(mnemonic, label, linkTitle);
    }
  }
}

async function createOpcodeMap() {
  let instructions = await DataProvider.getInstructions();
  const opcodeMap = {};

  for (const instruction of instructions) {
    //skip pseudo instructions as they don't have an opcode
    const mnemonic = instruction.getMnemonic();
    if (instruction.isPSEUDO()) {
      continue;
    }
    const originalOpcode = instruction.getOpcode();

    if (mnemonic === "movs") {
      const opcodeMapForMovSpecial = await getOpcodeMapForMoveSpecial(instruction);
      opcodeMapForMovSpecial.forEach(({ opcode, label }) => {
        opcodeMap[opcode] = label;
      });
      continue;
    }

    if (originalOpcode.length !== 8) {
      console.error(`Opcode length is not 8: ${originalOpcode}`);
    }

    const registerCount = Statistics.countCharsInString(originalOpcode, "R") / 2; //2 bits per register in opcode, registerCount is either 0, 1 or 2
    const lcdRegisterCount = Statistics.countCharsInString(originalOpcode, "L");
    if (registerCount === 0) {
      let label = mnemonic;
      if (lcdRegisterCount > 0) {
        for (let i = 0; i < 2; i++) {
          let opcode = `${originalOpcode.replaceAll("L", i.toString(2))}`;
          label += `<br>&lt;imm&gt;<br>&rarr;${LCDREGISTER_LOOKUP[i]}`;
          opcodeMap[opcode] = label;
          label = mnemonic; //reset label for next iteration
        }
      } else {
        opcodeMap[originalOpcode] = mnemonic;
      }
    } else if (registerCount == 1) {
      let label = mnemonic;
      const isLCDInstruction = Statistics.countCharsInString(originalOpcode, "L") > 0;

      //outer for-loop is only for the lcd-instructions which contain the L-register arguments
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 4; j++) {
          let opcode = `${originalOpcode.replaceAll("L", i.toString(2))}`;
          opcode = `${opcode.replaceAll("R", "")}${j.toString(2).padStart(2, "0")}`;
          if (isLCDInstruction) {
            label += `<br>${REGISTER_LOOKUP[j]}&rarr;${LCDREGISTER_LOOKUP[i]}`;
          } else {
            label += `<br>&rarr;${REGISTER_LOOKUP[j]}`;
          }
          opcodeMap[opcode] = label;
          label = mnemonic; //reset label for next iteration
        }
      }
    } else if (registerCount == 2) {
      let label = mnemonic;
      for (let i = 0; i < 16; i++) {
        let opcode = `${originalOpcode.replaceAll("R", "")}${i.toString(2).padStart(4, "0")}`;
        const upperRegisterIndex = (i >> 2) & 0b11;
        const lowerRegisterIndex = i & 0b11;
        label += `<br>${REGISTER_LOOKUP[upperRegisterIndex]}&rarr;${REGISTER_LOOKUP[lowerRegisterIndex]}`;
        opcodeMap[opcode] = label;
        label = mnemonic;
      }
    } else {
      console.error(
        `Invalid register count! The maximum allowed amount of registers per instruction is 2, but it was ${registerCount}.`
      );
    }
  }

  return opcodeMap;
}

async function getOpcodeMapForMoveSpecial(instruction) {
  const opcode = instruction.getOpcode();
  if (Statistics.countCharsInString(opcode, "R") != 4) {
    console.error("R-count in movs opcode should be 4!");
  }
  const firstNibble = opcode.substring(0, 4);
  const response = await fetch("../resources/data/movsData.json");
  const movsData = await response.json();
  return movsData.map((entry) => ({
    opcode: `${firstNibble}${entry.secondNibble}`,
    label: `movs<br>${entry.from}&rarr;${entry.to}`,
  }));
}

createOpcodeMatrixTableCells();
fillOpcodeMatrix();
