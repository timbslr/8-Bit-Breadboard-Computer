import { applyFirstRowStylesByColumn, deleteFirstRow, getTableBodyById } from "./tableUtil.js";
import {
  getInstructions,
  generateLinkToMnemonic,
  escapeHTML,
  joinMnemonicAndOperands,
  joinMappedInstructionsWithLink,
  isPSEUDOInstruction,
} from "./util.js";

let instructions; //store instructions from json-file globally to make them accessible to other methods
async function fillOverviewTables() {
  instructions = await getInstructions();
  const groupedInstructions = Object.groupBy(instructions, (instructions) => instructions.group);

  let pseudoInstructions = [];

  Object.values(groupedInstructions).forEach((sameGroupInstructions) => {
    //sort each group by indexInGroup and add to table
    sameGroupInstructions.sort((instr1, instr2) => instr1.indexInGroup - instr2.indexInGroup); //sort in ascending alphabetical order
    const tableId = `${sameGroupInstructions[0].group}-table`;
    const pseudoInstructionsInGroup = addEntriesToTable(tableId, sameGroupInstructions, [
      "opcode",
      "mnemonic",
      "instruction",
      "shortDescription",
    ]);
    pseudoInstructions = pseudoInstructions.concat(pseudoInstructionsInGroup);
    applyFirstRowStylesByColumn(tableId);
    deleteFirstRow(tableId);
  });

  addEntriesToTable("pseudo-instructions-table", pseudoInstructions, ["mnemonic", "instruction", "mappedInstructions"]);
  applyFirstRowStylesByColumn("pseudo-instructions-table");
  deleteFirstRow("pseudo-instructions-table");
}

function addEntriesToTable(tableId, entries, properties) {
  const pseudoInstructionsInGroup = [];
  const tableBody = getTableBodyById(tableId);
  entries.forEach((entry) => {
    const newTableRow = document.createElement("tr");

    properties.forEach((property) => {
      const newCell = document.createElement("td");
      let innerHTML = entry[property] || "-";
      switch (property) {
        case "mnemonic": {
          const isPSEUDO = isPSEUDOInstruction(entry.mnemonic, instructions);
          const label = isPSEUDO ? `*${entry.mnemonic}` : entry.mnemonic;
          innerHTML = generateLinkToMnemonic(innerHTML, label, isPSEUDO);
          if (isPSEUDO) {
            pseudoInstructionsInGroup.push(entry);
          }
          break;
        }
        case "instruction": {
          innerHTML = escapeHTML(joinMnemonicAndOperands(entry.mnemonic, entry.operands));
          break;
        }
        case "mappedInstructions": {
          innerHTML = joinMappedInstructionsWithLink(entry.mappedInstructions, instructions);
          break;
        }
        case "shortDescription": {
          innerHTML = escapeHTML(innerHTML);
          break;
        }
      }

      newCell.innerHTML = innerHTML;
      newTableRow.appendChild(newCell);
    });

    tableBody.appendChild(newTableRow);
  });

  return pseudoInstructionsInGroup;
}

fillOverviewTables();
