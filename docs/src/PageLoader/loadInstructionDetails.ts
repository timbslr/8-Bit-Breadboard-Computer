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
  const descriptionElements = await getDescriptions(sortedInstructions.map((instruction) => instruction.getMnemonic()));

  for (const instruction of sortedInstructions) {
    // print clobbered registers for the entry in .customasm.json
    /* if (instruction.getClobberedRegisters().size > 0) {
      console.log(
        `{ "mnemonic": "${instruction.getMnemonic()}", "clobberedRegisters": [${Array.from(instruction.getClobberedRegisters())
          .map((reg) => `"${reg}"`)
          .join(", ")}] },`,
      );
    } */

    const instructionDetailSection = createHTMLInstructionDetailSection(
      instruction,
      descriptionElements.get(instruction.getMnemonic()) as HTMLElement,
    );
    mainContent.appendChild(instructionDetailSection);
  }

  scrollToHeaderIfNecessary(); // scroll header into view if the url contains a hash linking to it
}

function createHTMLInstructionDetailSection(instruction: Instruction, description: HTMLElement): HTMLElement {
  const section = document.createElement("div");
  const mnemonic = instruction.getMnemonic();

  const header = document.createElement("h4");
  header.id = mnemonic;
  header.classList.add("header");
  header.innerHTML = `${mnemonic} &ndash; ${instruction.getName()}`;
  section.appendChild(header);

  const table = createTableForInstruction(instruction);
  section.appendChild(table);

  section.appendChild(description);

  section.appendChild(document.createElement("br"));
  section.appendChild(document.createElement("br"));
  section.appendChild(document.createElement("br"));

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

async function getDescriptions(mnemonics: string[]): Promise<Map<string, HTMLElement>> {
  const DESCRIPTION_FOLDER_PATH = "../resources/data/instructionDescriptions/";

  const descriptionPromises = mnemonics.map((mnemonic) => fetchHTML(DESCRIPTION_FOLDER_PATH + mnemonic + ".html"));
  const descriptionHTMLs = await Promise.all(descriptionPromises);

  const map = new Map();
  mnemonics.forEach((mnemonic, index) => {
    const div = document.createElement("div");
    div.innerHTML = descriptionHTMLs[index];
    div.classList.add("description");
    map.set(mnemonic, div);
  });

  return map;
}

async function fetchHTML(filePath: string) {
  try {
    const response = await fetch(filePath);
    if (!response.ok) return ""; // file doesn't exist
    return await response.text();
  } catch (err) {
    console.error("Error fetching", filePath, err);
    return "";
  }
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
