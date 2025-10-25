import { getTableBodyByID, applyFirstRowStylesByColumn, deleteFirstRow, getControlBits } from "./util.js";

async function createAndFillTables() {
  let controlBits = await getControlBits();
  controlBits = Object.groupBy(controlBits, (controlBits) => controlBits.associatedModule);
  const mainContent = document.getElementById("main-content");
  console.log(mainContent);

  const templateTable = document.getElementById("template-table");

  Object.entries(controlBits).forEach(([moduleName, moduleProperties]) => {
    const templateTableCopy = templateTable.cloneNode(true); //true for deep-cloning
    const tableId = `${moduleName}-table`;
    templateTableCopy.id = tableId;

    moduleProperties.forEach((controlBit) => {
      const newRow = templateTableCopy.insertRow();
      const abbreviationCell = newRow.insertCell(0);
      abbreviationCell.innerHTML = controlBit.isActiveHigh
        ? controlBit.abbreviation
        : `<span style="text-decoration: overline;"> ${controlBit.abbreviation} </span>`;
      const nameCell = newRow.insertCell(1);
      nameCell.innerHTML = controlBit.name;
      const synchronousCell = newRow.insertCell(2);
      synchronousCell.innerHTML = controlBit.isSynchronous ? "s" : "a";
      const descriptionCell = newRow.insertCell(3);
      descriptionCell.innerHTML = controlBit.description;
    });

    const tableHeader = document.createElement("h2");
    tableHeader.innerHTML = moduleName;

    mainContent.appendChild(tableHeader, templateTable.nextSibling);

    const wrapperDiv = document.createElement("div");
    wrapperDiv.classList.add("table-wrapper");
    wrapperDiv.appendChild(templateTableCopy);

    mainContent.appendChild(wrapperDiv, tableHeader.nextSibling);

    deleteFirstRow(tableId);
  });

  templateTable.remove();
}

createAndFillTables();
