import { INDEX_REGISTER_LOOKUP, LCDREGISTER_LOOKUP, REGISTER_LOOKUP } from "../Instruction/Instruction.js";
import TableBuilder from "../TableBuilder.js";
import DataProvider from "../DataProvider.js";
import Formatter from "../Formatter.js";
import PSEUDOInstruction from "../Instruction/PSEUDOInstruction.js";
import REALInstruction from "../Instruction/REALInstruction.js";

type MovDataEntry = { opcode: string; from: string; to: string };
const BASE_TWO = 2;
const BASE_SIXTEEN = 16;
const opcodeMap = new Map();

function createOpcodeMatrixTableCells() {
  const placeholder = document.getElementById("placeholder-opcode-table");

  //create an empty table which only contains the opcode nibbles for description, the instructions will be added in another method
  const table = new TableBuilder()
    .headers(["", "-0", "-1", "-2", "-3", "-4", "-5", "-6", "-7", "-8", "-9", "-A", "-B", "-C", "-D", "-E", "-F"])
    .addRows(
      Array(16)
        .fill("") //turn sparse array into an actual array, otherwise .map() doesn't behave as expected
        .map((_, index) => [`${index.toString(BASE_SIXTEEN).toUpperCase()}-`, ...Array(16).fill("")]), //creates 16 rows, each has an opcode nibble followed by 16 empty cells
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
    const opcodeBinary = i.toString(BASE_TWO).padStart(8, "0");
    const opcodeHex = i.toString(BASE_SIXTEEN).padStart(2, "0").toUpperCase();
    const row = parseInt(opcodeHex[0], BASE_SIXTEEN);
    const col = parseInt(opcodeHex[1], BASE_SIXTEEN);
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
  opcodeMap.clear();
  let instructions = await DataProvider.getInstructions();

  const setOpcodeMap = (binaryOpcode: string, label: string) => {
    if (opcodeMap.has(binaryOpcode) && opcodeMap.get(binaryOpcode) !== label) {
      throw new Error(
        `Opcode ${binaryOpcode} already exists (Existing key: ${opcodeMap.get(binaryOpcode)}) and would be overwritten by this assignment (New key: ${label})! Check the ISA-specification to resolve the overlap!`,
      );
    }
    opcodeMap.set(binaryOpcode, label);
  };

  for (const instruction of instructions) {
    //skip pseudo instructions as they don't have an opcode
    const mnemonic = instruction.getMnemonic();
    if (instruction instanceof PSEUDOInstruction) {
      continue;
    }

    if (mnemonic === "mov") {
      const opcodeMapForMov = await getOpcodeMapForMov(instruction as REALInstruction);
      opcodeMapForMov.forEach(({ opcode, label }) => {
        setOpcodeMap(opcode, label);
      });
      continue;
    }

    const originalOpcode = (instruction as REALInstruction).getOpcode().getOriginalString();

    if (originalOpcode.length !== 8) {
      throw new Error(`Opcode length is not 8: ${originalOpcode}`);
    }

    const registerCount = countCharsInString(originalOpcode, "R") / 3; //3 bits per register in opcode, registerCount is either 0 or 1
    const lcdRegisterCount = countCharsInString(originalOpcode, "L");
    const isLCDInstruction = lcdRegisterCount > 0;
    const isIndexRegisterInstruction = countCharsInString(originalOpcode, "X") > 0;
    if (registerCount === 0) {
      let label = mnemonic;
      if (lcdRegisterCount > 0) {
        for (let i = 0; i < LCDREGISTER_LOOKUP.length; i++) {
          for (let j = 0; j < INDEX_REGISTER_LOOKUP.length; j++) {
            let opcode = `${originalOpcode.replaceAll("L", i.toString(BASE_TWO)).replaceAll("X", j.toString(BASE_TWO))}`;
            label += `<br>&lt;imm&gt;<br>&rarr;${LCDREGISTER_LOOKUP[i]}`;
            setOpcodeMap(opcode, label);
            label = mnemonic; //reset label for next iteration
          }
        }
      } else {
        setOpcodeMap(originalOpcode, mnemonic);
      }
    } else if (registerCount == 1) {
      let label = mnemonic;

      //outer for-loop is only for the lcd-instructions which contain the L-register arguments
      for (let i = 0; i < LCDREGISTER_LOOKUP.length; i++) {
        for (let j = 0; j < REGISTER_LOOKUP.length; j++) {
          for (let k = 0; k < INDEX_REGISTER_LOOKUP.length; k++) {
            let opcode = originalOpcode.replaceAll("RRR", j.toString(BASE_TWO).padStart(3, "0"));
            opcode = `${opcode.replaceAll("L", i.toString(BASE_TWO)).replaceAll("X", k.toString(BASE_TWO))}`;
            if (isIndexRegisterInstruction) {
              label += ` ${INDEX_REGISTER_LOOKUP[k]}`;
            }
            if (isLCDInstruction) {
              label += `<br>${REGISTER_LOOKUP[j]}&rarr;${LCDREGISTER_LOOKUP[i]}`;
            } else {
              label += `<br>&rarr;${REGISTER_LOOKUP[j]}`;
            }
            setOpcodeMap(opcode, label);
            label = mnemonic; //reset label for next iteration
          }
        }
      }
    } else {
      throw new Error(`Invalid register count! The maximum allowed amount of registers per instruction is 2, but it was ${registerCount}.`);
    }
  }

  return opcodeMap;
}

async function getOpcodeMapForMov(instruction: REALInstruction): Promise<[{ opcode: string; label: string }]> {
  const response = await fetch(`${window.BASE_URL}/resources/data/movData.json`);
  const movData = await response.json();
  return movData.map((entry: MovDataEntry) => ({
    opcode: `${entry.opcode}`,
    label: `mov<br>${entry.from}&rarr;${entry.to}`,
  }));
}

function countCharsInString(string: string, char: string) {
  return [...string].filter((c) => c === char).length;
}

function copyOpcodeMap() {
  let entries = new Array(256).fill(`"INVALID"`);
  console.log(opcodeMap);
  opcodeMap.forEach((value, key) => {
    const index = parseInt(key, 2);
    entries[index] = `"${value}"`;
  });
  const clipboardString = entries.join(",\n").replaceAll("<br>", " ").replaceAll("&rarr;", "->").replaceAll("&lt;", "<").replaceAll("&gt;", ">");

  const icon = document.getElementById("copy-button-icon") as HTMLImageElement;
  navigator.clipboard
    .writeText(clipboardString)
    .then(() => {
      const originalIcon = icon.src;
      console.log(originalIcon);
      icon.src = originalIcon + "/../check.svg";
      setTimeout(() => {
        icon.src = originalIcon;
      }, 1500);
    })
    .catch((err) => {
      console.error("Failed to copy text: ", err);
    });
}
// Expose function to global scope
(window as any).copyOpcodeMap = copyOpcodeMap;

createOpcodeMatrixTableCells();
fillOpcodeMatrix();
