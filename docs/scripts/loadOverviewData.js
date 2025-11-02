import InstructionsUtilProvider from "./InstructionsUtilProvider.js";
import TableUtilProvider from "./TableUtilProvider.js";

async function fillOverviewTables() {
  const groupedInstructions = await InstructionsUtilProvider.getGroupedInstructionObjects();

  let pseudoInstructions = [];

  for (const sameGroupInstructions of Object.values(groupedInstructions)) {
    //sort each group by indexInGroup and add to table
    sameGroupInstructions.sort((instr1, instr2) => instr1.indexInGroup - instr2.indexInGroup); //sort in ascending alphabetical order
    const tableId = `${sameGroupInstructions[0].group}-table`;
    const pseudoInstructionsInGroup = await TableUtilProvider.addEntriesToTable(tableId, sameGroupInstructions, [
      "opcode",
      "mnemonic",
      "instruction",
      "shortDescription",
    ]);
    pseudoInstructions = pseudoInstructions.concat(pseudoInstructionsInGroup);
    TableUtilProvider.applyFirstRowStylesToColumnsById(tableId);
    TableUtilProvider.deleteFirstRowById(tableId);
  }

  TableUtilProvider.addEntriesToTable("pseudo-instructions-table", pseudoInstructions, [
    "mnemonic",
    "instruction",
    "mappedInstructions",
  ]);
  TableUtilProvider.applyFirstRowStylesToColumnsById("pseudo-instructions-table");
  TableUtilProvider.deleteFirstRowById("pseudo-instructions-table");
}

fillOverviewTables();
