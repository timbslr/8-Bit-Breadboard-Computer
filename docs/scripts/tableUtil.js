export function createRowFromCellContent(cellContents) {
  const row = document.createElement("tr");

  cellContents.forEach((cellContent) => {
    const cell = document.createElement("td");
    cell.innerHTML = cellContent;
    row.appendChild(cell);
  });

  return row;
}

export function getTableBodyById(tableId) {
  const table = document.getElementById(tableId);
  if (!table) {
    console.error(`Table with id ${tableId} not found!`);
    return;
  }

  return table.querySelector("tbody");
}

export function applyFirstRowStylesByColumn(tableID) {
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

export function deleteFirstRow(tableId) {
  const tableBody = getTableBodyById(tableId);
  tableBody.deleteRow(0);
}

export function attachTableWrapper(table) {
  const wrapperDiv = document.createElement("div");
  wrapperDiv.classList.add("table-wrapper");
  wrapperDiv.appendChild(table);
  return wrapperDiv;
}
