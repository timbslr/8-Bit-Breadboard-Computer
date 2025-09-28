async function fillOverviewTables() {
  const response = await fetch("../resources/data/instructionData.json");
  const data = await response.json();
  let instructions = data.instructions;
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

function applyFirstRowStylesByColumn(tableID) {
  const table = document.getElementById(tableID);
  const rows = table.querySelectorAll("tr");
  const firstRowCells = rows[0].cells;

  for (let i = 1; i < rows.length; i++) {
    const rowCells = rows[i].cells;
    for (let j = 0; j < firstRowCells.length; j++) {
      if (!rowCells[j]) continue;
      rowCells[j].style.cssText += firstRowCells[j].style.cssText;
    }
  }
}

function deleteFirstRow(tableId) {
  const tableBody = getTableBodyByID(tableId);
  tableBody.deleteRow(0);
}

function getTableBodyByID(tableId) {
  const table = document.getElementById(tableId);
  if (!table) {
    console.error(`Table with id ${tableId} not found!`);
    return;
  }

  return table.querySelector("tbody");
}

fillOverviewTables();
