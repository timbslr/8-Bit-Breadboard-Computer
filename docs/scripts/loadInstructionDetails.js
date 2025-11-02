import InstructionsUtilProvider from "./InstructionsUtilProvider.js";
import StatisticsProvider from "./StatisticsProvider.js";
import TableUtilProvider from "./TableUtilProvider.js";

async function createAndFillTables() {
  const sortedInstructions = await InstructionsUtilProvider.getSortedInstructionObjectsByMnemonic(); //sort in ascending alphabetical order
  const mainContent = document.getElementById("main-content"); //the section for the pages main content

  const templateTable = document.getElementById("template-stats-table"); //the template table which defines layouts

  for (const instruction of sortedInstructions) {
    const mnemonic = instruction.mnemonic;
    const opcode = instruction.opcode || "-";

    const sizeInROM = await StatisticsProvider.getByteSizeInROM(mnemonic);
    let sizeInROMString = `${sizeInROM} Byte`;
    if (sizeInROM !== 1) {
      sizeInROMString += "s"; //s for Bytes
    }

    const numberOfClockCycles = await StatisticsProvider.getAmountOfClockCyclesPerExecution(mnemonic);

    const numberOfClockCyclesString = StatisticsProvider.formatNumberOfClockCyclesString(numberOfClockCycles);

    const tableId = `${mnemonic}-table`;

    const header = document.createElement("h4");
    header.id = mnemonic;
    header.innerHTML = `${mnemonic} &ndash; ${instruction.name}`;
    mainContent.appendChild(header);

    const lineBreak = document.createElement("br");
    mainContent.appendChild(lineBreak);

    let templateTableCopy = templateTable.cloneNode(true); //true for deep-cloning

    templateTableCopy.id = tableId;

    const cellContents = [instruction.type, instruction.group, opcode, sizeInROMString, numberOfClockCyclesString];
    const contentRow = TableUtilProvider.createRowFromCellContents(cellContents);
    templateTableCopy.appendChild(contentRow);

    templateTableCopy = TableUtilProvider.surroundWithTableWrapper(templateTableCopy);

    mainContent.appendChild(templateTableCopy, lineBreak.nextSibling);

    TableUtilProvider.applyFirstRowStylesToColumnsById(tableId);
    TableUtilProvider.deleteFirstRowById(tableId); //that was the "Loading..." row from the template-table
  }

  templateTable.remove();

  scrollToHeaderIfNecessary(); //scroll header into view if the url contains a hash linking to it
}

function scrollToHeaderIfNecessary() {
  const headerLinkFromURL = window.location.hash;
  if (!headerLinkFromURL) return;

  const headerId = headerLinkFromURL.replace("#", "");
  const targetHeader = document.getElementById(headerId);
  if (!targetHeader) return;

  targetHeader.scrollIntoView({ behavior: "instant" });

  //highlight header for 1 second
  targetHeader.classList.add("highlightedHeader");
  setTimeout(() => {
    targetHeader.classList.remove("highlightedHeader");
  }, 1000);
}

createAndFillTables();
window.addEventListener("hashchange", scrollToHeaderIfNecessary); //if the hash linking to a header changed
