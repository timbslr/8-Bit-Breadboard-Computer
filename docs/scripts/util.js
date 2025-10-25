export const REGISTER_LOOKUP = ["A", "B", "X", "T"];

export function getTableBodyByID(tableId) {
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
  const tableBody = getTableBodyByID(tableId);
  tableBody.deleteRow(0);
}

export async function getInstructions() {
  const response = await fetch("../resources/data/instructionData.json");
  const data = await response.json();
  return data.instructions;
}

export async function getControlBits() {
  const response = await fetch("../resources/data/controlBits.json");
  const data = await response.json();
  return data.controlBits;
}

export function getAmountOfCharOccurrencesInString(string, char) {
  return [...string].filter((c) => c === char).length;
}
