import TableBuilder from "../TableBuilder.js";
import Formatter from "../Formatter.js";
import DataProvider from "../DataProvider.js";

async function createAndFillTables() {
  let controlBits = await DataProvider.getControlBits();
  controlBits = Object.groupBy(controlBits, (controlBits) => controlBits.associatedModule); //group by associated module
  const mainContent = document.getElementById("main-content");

  Object.entries(controlBits).forEach(([groupName, moduleProperties]) => {
    const table = new TableBuilder()
      .headers(["Abbreviation", "Name", "s/a", "Description"])
      .addRows(createTableRowsFromProperties(moduleProperties))
      .textAlign(["left", "left", "center", "left"])
      .id(`${groupName}-table`)
      .build();

    const tableDescription = document.createElement("h2");
    tableDescription.innerHTML = groupName;
    mainContent.appendChild(tableDescription);

    mainContent.appendChild(table);
  });
}

function createTableRowsFromProperties(moduleProperties) {
  const rows = [];
  moduleProperties.forEach((controlBit) => {
    const abbreviation = controlBit.isActiveHigh ? controlBit.abbreviation : Formatter.appendHTMLBar(controlBit.abbreviation);
    const synchronousCellContent = controlBit.isSynchronous ? "s" : "a";
    rows.push([abbreviation, controlBit.name, synchronousCellContent, controlBit.description]);
  });

  return rows;
}

createAndFillTables();
