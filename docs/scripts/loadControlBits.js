import {
  applyFirstRowStylesByColumn,
  attachTableWrapper,
  createRowFromCellContent,
  deleteFirstRow,
} from "./tableUtil.js";
import { getControlBits } from "./util.js";

async function createAndFillTables() {
  let controlBits = await getControlBits();
  controlBits = Object.groupBy(controlBits, (controlBits) => controlBits.associatedModule); //group by associated module
  const mainContent = document.getElementById("main-content");

  const templateTable = document.getElementById("template-table");

  Object.entries(controlBits).forEach(([moduleName, moduleProperties]) => {
    const tableId = `${moduleName}-table`;
    let templateTableCopy = templateTable.cloneNode(true); //true for deep-cloning
    templateTableCopy.id = tableId;

    moduleProperties.forEach((controlBit) => {
      const abbreviation = controlBit.isActiveHigh
        ? controlBit.abbreviation
        : `<span style="text-decoration: overline;"> ${controlBit.abbreviation} </span>`;
      const synchronousCellContent = controlBit.isSynchronous ? "s" : "a";
      const cellContents = [abbreviation, controlBit.name, synchronousCellContent, controlBit.description];
      const row = createRowFromCellContent(cellContents);
      templateTableCopy.appendChild(row);
    });

    const tableHeader = document.createElement("h2");
    tableHeader.innerHTML = moduleName;
    mainContent.appendChild(tableHeader);

    templateTableCopy = attachTableWrapper(templateTableCopy);

    mainContent.appendChild(templateTableCopy);

    applyFirstRowStylesByColumn(tableId);
    deleteFirstRow(tableId);
  });

  templateTable.remove();
}

createAndFillTables();
