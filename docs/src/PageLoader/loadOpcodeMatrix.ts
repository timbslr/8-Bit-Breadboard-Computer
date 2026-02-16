import Instruction, { LCDREGISTER_LOOKUP, REGISTER_LOOKUP } from "../Instruction/Instruction.js";
import TableBuilder from "../TableBuilder.js";
import DataProvider from "../DataProvider.js";
import Formatter from "../Formatter.js";
import PSEUDOInstruction from "../Instruction/PSEUDOInstruction.js";
import REALInstruction from "../Instruction/REALInstruction.js";

type MovsDataEntry = { secondNibble: string; from: string; to: string };

function createOpcodeMatrixTableCells() {
  const placeholder = document.getElementById("placeholder-opcode-table");

  //create an empty table which only contains the opcode nibbles for description, the instructions will be added in another method
  const table = new TableBuilder()
    .headers(["", "-0", "-1", "-2", "-3", "-4", "-5", "-6", "-7", "-8", "-9", "-A", "-B", "-C", "-D", "-E", "-F"])
    .addRows(
      Array(16)
        .fill("") //turn sparse array into an actual array, otherwise .map() doesn't behave as expected
        .map((_, index) => [`${index.toString(16).toUpperCase()}-`, ...Array(16).fill("")]), //creates 16 rows, each has an opcode nibble followed by 16 empty cells
    )
    .firstColumnMinWidth("30px")
    .id("opcode-table")
    .textAlign(Array(17).fill("center"))
    .build();

  placeholder?.parentNode?.insertBefore(table, placeholder);
  placeholder?.remove();
}

async function fillOpcodeMatrix() {
  const table = document.getElementById("opcode-table") as HTMLTableElement;
  const opcodeMap = await createOpcodeMap(); //stores all opcodes in binary mapped to their corresponding labels

  for (let i = 0; i < 256; i++) {
    const opcodeBinary = i.toString(2).padStart(8, "0");
    const opcodeHex = i.toString(16).padStart(2, "0").toUpperCase();
    const row = parseInt(opcodeHex[0], 16);
    const col = parseInt(opcodeHex[1], 16);
    const label = opcodeMap.get(opcodeBinary);
    const currentCell = table.rows[row + 1].cells[col + 1];

    //if the label exists/the opcode is used, put it into the corresponding cell
    if (label) {
      const mnemonic = label.split("<br>")[0];
      let linkTitle = `0x${opcodeHex}: ${label}`.replace("<br>", " "); //replace <br> between mnemonic and arguments with space
      linkTitle = linkTitle.replaceAll("<br>", ""); //remove all <br> that are left
      currentCell.innerHTML = Formatter.decorateTextWithLink(label, `./details#${mnemonic}`, linkTitle);
    }
  }
}

async function createOpcodeMap(): Promise<Map<string, string>> {
  let instructions = await DataProvider.getInstructions();
  const opcodeMap = new Map();

  for (const instruction of instructions) {
    //skip pseudo instructions as they don't have an opcode
    const mnemonic = instruction.getMnemonic();
    if (instruction instanceof PSEUDOInstruction) {
      continue;
    }

    const originalOpcode = (instruction as REALInstruction).getOpcode().getOriginalString();

    if (mnemonic === "movs") {
      const opcodeMapForMovSpecial = await getOpcodeMapForMoveSpecial(instruction as REALInstruction);
      opcodeMapForMovSpecial.forEach(({ opcode, label }) => {
        opcodeMap.set(opcode, label);
      });
      continue;
    }

    if (originalOpcode.length !== 8) {
      throw new Error(`Opcode length is not 8: ${originalOpcode}`);
    }

    const registerCount = countCharsInString(originalOpcode, "R") / 2; //2 bits per register in opcode, registerCount is either 0, 1 or 2
    const lcdRegisterCount = countCharsInString(originalOpcode, "L");
    if (registerCount === 0) {
      let label = mnemonic;
      if (lcdRegisterCount > 0) {
        for (let i = 0; i < 2; i++) {
          let opcode = `${originalOpcode.replaceAll("L", i.toString(2))}`;
          label += `<br>&lt;imm&gt;<br>&rarr;${LCDREGISTER_LOOKUP[i]}`;
          opcodeMap.set(opcode, label);
          label = mnemonic; //reset label for next iteration
        }
      } else {
        opcodeMap.set(originalOpcode, mnemonic);
      }
    } else if (registerCount == 1) {
      let label = mnemonic;
      const isLCDInstruction = countCharsInString(originalOpcode, "L") > 0;

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
          opcodeMap.set(opcode, label);
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
        opcodeMap.set(opcode, label);
        label = mnemonic;
      }
    } else {
      throw new Error(`Invalid register count! The maximum allowed amount of registers per instruction is 2, but it was ${registerCount}.`);
    }
  }

  return opcodeMap;
}

async function getOpcodeMapForMoveSpecial(instruction: REALInstruction): Promise<[{ opcode: string; label: string }]> {
  const opcodeString = instruction.getOpcode().getOriginalString();
  if (countCharsInString(opcodeString, "R") != 4) {
    throw new Error("R-count in movs opcode should be 4!");
  }
  const firstNibble = opcodeString.substring(0, 4);
  const response = await fetch(`${window.BASE_URL}/resources/data/movsData.json`);
  const movsData = await response.json();
  return movsData.map((entry: MovsDataEntry) => ({
    opcode: `${firstNibble}${entry.secondNibble}`,
    label: `movs<br>${entry.from}&rarr;${entry.to}`,
  }));
}

function countCharsInString(string: string, char: string) {
  return [...string].filter((c) => c === char).length;
}

createOpcodeMatrixTableCells();
fillOpcodeMatrix();
