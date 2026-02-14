import Formatter from "../Formatter.js";
import Instruction from "../Instruction/Instruction.js";
import REALInstruction from "../Instruction/REALInstruction.js";
import InstructionRepository from "../Instruction/InstructionRepository.js";
import { InstructionClockCyclesStatistic } from "../Statistics/InstructionClockCyclesStatistic.js";
import { InstructionMemorySizeStatistic } from "../Statistics/InstructionMemorySizeStatistic.js";
import TableBuilder from "../TableBuilder.js";

async function createAndFillTables() {
  const sortedInstructions = await InstructionRepository.getSorted();
  const mainContent = document.getElementById("main-content") as HTMLElement; // the section for the pages main content

  for (const instruction of sortedInstructions) {
    const instructionDetailSection = createHTMLInstructionDetailSection(instruction);
    mainContent.appendChild(instructionDetailSection);
  }

  scrollToHeaderIfNecessary(); // scroll header into view if the url contains a hash linking to it
}

function createHTMLInstructionDetailSection(instruction: Instruction): HTMLElement {
  const section = document.createElement("div");
  const mnemonic = instruction.getMnemonic();

  const tableDescriptionHeader = document.createElement("h4");
  tableDescriptionHeader.id = mnemonic;
  tableDescriptionHeader.innerHTML = `${mnemonic} &ndash; ${instruction.getName()}`;
  section.appendChild(tableDescriptionHeader);

  const table = createTableForInstruction(instruction);
  section.appendChild(table);

  const lineBreak = document.createElement("br");
  section.appendChild(lineBreak);

  return section;
}

function createTableForInstruction(instruction: Instruction): HTMLElement {
  const opcodeString = instruction.isPSEUDO() ? "-" : (instruction as REALInstruction).getOpcode().getOriginalString();
  const clobberedRegistersString = Formatter.formatClobberedRegisters(instruction.getClobberedRegisters());

  const memSizeStat = new InstructionMemorySizeStatistic(instruction);
  const clockCyclesStat = new InstructionClockCyclesStatistic(instruction);

  return new TableBuilder()
    .headers(["Instruction Type", "Group", "Opcode", "Clobbered Registers", memSizeStat.name, clockCyclesStat.name])
    .addRow([
      instruction.isPSEUDO() ? "PSEUDO" : "REAL",
      instruction.getGroup(),
      opcodeString,
      clobberedRegistersString,
      memSizeStat.formatted(),
      clockCyclesStat.formatted(),
    ])
    .textAlign(["center", "center", "center", "center", "center", "center"])
    .id(`${instruction.getMnemonic()}-table`)
    .build();
}

function scrollToHeaderIfNecessary() {
  const headerLinkFromURL = window.location.hash;
  if (!headerLinkFromURL) return;

  const headerId = headerLinkFromURL.replace("#", "");
  const targetHeader = document.getElementById(headerId);
  if (!targetHeader) return;

  targetHeader.scrollIntoView({ behavior: "instant" });

  // highlight header for 1 second
  targetHeader.classList.add("highlightedHeader");
  setTimeout(() => {
    targetHeader.classList.remove("highlightedHeader");
  }, 1000);
}

createAndFillTables();
window.addEventListener("hashchange", scrollToHeaderIfNecessary); // if the hash linking to a header changed
