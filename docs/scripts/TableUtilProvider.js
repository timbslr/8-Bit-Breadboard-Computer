import Formatter from "./Formatter.js";
import InstructionsUtilProvider from "./InstructionsUtilProvider.js";

export default class TableUtilProvider {
  static getTableBodyById(tableId) {
    const table = document.getElementById(tableId);
    if (!table) {
      console.error(`Table with id ${tableId} not found!`);
      return;
    }

    return table.querySelector("tbody");
  }

  static deleteFirstRowById(tableId) {
    const tableBody = this.getTableBodyById(tableId);
    tableBody.deleteRow(0);
  }

  static surroundWithTableWrapper(tableObject) {
    const wrapperDiv = document.createElement("div");
    wrapperDiv.classList.add("table-wrapper");
    wrapperDiv.appendChild(tableObject);
    return wrapperDiv;
  }

  static createRowFromCellContents(cellContentsArray) {
    const row = document.createElement("tr");

    cellContentsArray.forEach((cellContent) => {
      const cell = document.createElement("td");
      cell.innerHTML = cellContent;
      row.appendChild(cell);
    });

    return row;
  }

  static applyFirstRowStylesToColumnsById(tableID) {
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

  static async addEntriesToTable(tableId, entries, properties) {
    const pseudoInstructionsInGroup = [];
    const tableBody = this.getTableBodyById(tableId);
    for (const entry of entries) {
      const newTableRow = document.createElement("tr");

      for (const property of properties) {
        const newCell = document.createElement("td");
        let innerHTML = entry[property] || "-";
        switch (property) {
          case "mnemonic": {
            const isPSEUDO = await InstructionsUtilProvider.isPSEUDOInstruction(entry.mnemonic);
            const label = isPSEUDO ? `*${entry.mnemonic}` : entry.mnemonic;
            innerHTML = InstructionsUtilProvider.decorateMnemonicWithLink(innerHTML, label);
            if (isPSEUDO) {
              pseudoInstructionsInGroup.push(entry);
            }
            break;
          }
          case "instruction": {
            innerHTML = Formatter.escapeHTML(
              InstructionsUtilProvider.joinMnemonicWithOperands(entry.mnemonic, entry.operands)
            );
            break;
          }
          case "mappedInstructions": {
            innerHTML = await InstructionsUtilProvider.joinAndDecorateMappedInstructionsWithLink(
              entry.mappedInstructions
            );
            break;
          }
          case "shortDescription": {
            innerHTML = Formatter.escapeHTML(innerHTML);
            break;
          }
        }

        newCell.innerHTML = innerHTML;
        newTableRow.appendChild(newCell);
      }
      tableBody.appendChild(newTableRow);
    }

    return pseudoInstructionsInGroup;
  }

  static createPartsListTable(content) {
    const table = document.createElement("table");
    const headerRow = document.createElement("tr");
    const quantityHeader = document.createElement("th");
    quantityHeader.textContent = "Quantity";
    headerRow.appendChild(quantityHeader);
    const partNameHeader = document.createElement("th");
    partNameHeader.textContent = "Part Name";
    headerRow.appendChild(partNameHeader);
    table.appendChild(headerRow);

    for (const [partName, amount] of content.entries()) {
      const row = document.createElement("tr");
      const partNameCell = document.createElement("td");
      partNameCell.textContent = partName;
      const quantityCell = document.createElement("td");
      quantityCell.textContent = amount;
      quantityCell.style.textAlign = "center";

      row.appendChild(quantityCell);
      row.appendChild(partNameCell);
      table.appendChild(row);
    }

    return this.surroundWithTableWrapper(table);
  }
}
