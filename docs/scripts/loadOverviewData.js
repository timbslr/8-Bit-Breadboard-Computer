import {
  getTableBodyByID,
  applyFirstRowStylesByColumn,
  deleteFirstRow,
  getInstructions,
} from "./util.js";

async function fillOverviewTables() {
  let instructions = await getInstructions();
  instructions = instructions.reduce((groups, item) => {
    //group by group property
    const key = item.group;
    if (!groups[key]) {
      groups[key] = [item];
    } else {
      groups[key].push(item);
    }
    return groups;
  }, {});

  let pseudoInstructions = [];

  Object.values(instructions).forEach((group) => {
    //sort each group by indexInGroup and add to table
    group.sort((instr1, instr2) => instr1.indexInGroup - instr2.indexInGroup);
    const tableId = `${group[0].group}-table`;
    const pseudoInstructionsInGroup = addEntriesToTable(tableId, group, [
      "opcode",
      "mnemonic",
      "instruction",
      "shortDescription",
    ]);
    pseudoInstructions = pseudoInstructions.concat(pseudoInstructionsInGroup);
    applyFirstRowStylesByColumn(tableId);
    deleteFirstRow(tableId);
  });

  addEntriesToTable("pseudo-instructions-table", pseudoInstructions, [
    "mnemonic",
    "instruction",
    "mappedInstructions",
  ]);
  applyFirstRowStylesByColumn("pseudo-instructions-table");
  deleteFirstRow("pseudo-instructions-table");
}

function addEntriesToTable(tableId, entries, properties) {
  const pseudoInstructionsInGroup = [];
  const tableBody = getTableBodyByID(tableId);
  entries.forEach((entry) => {
    const newTableRow = document.createElement("tr");

    properties.forEach((property) => {
      const newCell = document.createElement("td");
      let innerHTML = entry[property] || "-";
      switch (property) {
        case "mnemonic": {
          if (entry.type === "PSEUDO") {
            innerHTML = `*${innerHTML}`;
            pseudoInstructionsInGroup.push(entry);
          }
          break;
        }
        case "instruction": {
          innerHTML = `${entry.mnemonic} ${entry.operands
            .map((operand) => `<${operand}>`)
            .join(", ")}`;
          break;
        }
        case "mappedInstructions": {
          innerHTML = entry.mappedInstructions.join("\n");
          break;
        }
      }

      const escapedInnerHTML = innerHTML
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\n", "<br>");

      newCell.innerHTML = escapedInnerHTML;
      newTableRow.appendChild(newCell);
    });

    tableBody.appendChild(newTableRow);
  });

  return pseudoInstructionsInGroup;
}

fillOverviewTables();
