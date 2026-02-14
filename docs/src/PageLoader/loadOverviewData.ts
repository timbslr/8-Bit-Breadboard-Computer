import Formatter from "../Formatter.js";
import Instruction from "../Instruction/Instruction.js";
import InstructionRepository from "../Instruction/InstructionRepository.js";
import PSEUDOInstruction from "../Instruction/PSEUDOInstruction.js";
import REALInstruction from "../Instruction/REALInstruction.js";
import TableBuilder from "../TableBuilder.js";

async function fillOverviewTables() {
  const groupedInstructions = await InstructionRepository.getGrouped();

  let pseudoInstructions: PSEUDOInstruction[] = [];

  //sort each group by indexInGroup and add to table
  for (const sameGroupInstructions of Object.values(groupedInstructions)) {
    //currently for ts only
    if (!sameGroupInstructions) {
      continue;
    }

    sameGroupInstructions.sort((instr1, instr2) => instr1.getIndexInGroup() - instr2.getIndexInGroup()); //sort in ascending alphabetical order
    const group = sameGroupInstructions[0].getGroup();
    const { rows, pseudoInstructionsInGroup } = await createTableRows(sameGroupInstructions);

    const table = new TableBuilder()
      .headers(["OpCode", "Mnemonic", "Instruction", "Description"])
      .addRows(rows)
      .textAlign(["center", "center", "left", "left"])
      .id(`${group}-table`)
      .build();

    const placeholder = document.querySelector(`#placeholder-${group}-table`);
    placeholder?.parentNode?.insertBefore(table, placeholder);
    placeholder?.remove();

    pseudoInstructions = pseudoInstructions.concat(pseudoInstructionsInGroup as PSEUDOInstruction[]);
  }

  //addEntriesToTable("pseudo-instructions-table", pseudoInstructions, ["mnemonic", "instruction", "mappedInstructions"]);
  const placeholder = document.querySelector(`#placeholder-pseudo-instructions-table`) as Element;
  const pseudoInstructionRows = await createPseudoInstructionRows(pseudoInstructions);
  const table = new TableBuilder()
    .headers(["Mnemonic", "Instruction", "Mapped Instructions"])
    .addRows(pseudoInstructionRows)
    .textAlign(["center", "center", "left"])
    .id(`pseudo-instruction-table`)
    .build();
  placeholder.parentNode?.insertBefore(table, placeholder);
  placeholder.remove();
}

async function createTableRows(instructions: Instruction[]) {
  const pseudoInstructionsInGroup = [];
  const rows = [];
  for (const instruction of instructions) {
    if (instruction.isPSEUDO()) {
      pseudoInstructionsInGroup.push(instruction);
    }

    const mnemonic = instruction.getMnemonic();
    const mnemonicStringWithLink = Formatter.decorateTextWithLink(instruction.isPSEUDO() ? `*${mnemonic}` : mnemonic, `./details#${mnemonic}`);

    const instructionString = Formatter.escapeHTML(
      Formatter.joinMnemonicWithOperands(
        mnemonic,
        instruction.getOperands().map((operand) => operand.getName()),
      ),
    );

    const opcodeString = instruction.isPSEUDO() ? "-" : (instruction as REALInstruction).getOpcode().getOriginalString();
    const shortDescription = Formatter.escapeHTML(instruction.getShortDescription());

    rows.push([opcodeString, mnemonicStringWithLink, instructionString, shortDescription]);
  }

  return { rows, pseudoInstructionsInGroup };
}

async function createPseudoInstructionRows(pseudoInstructions: PSEUDOInstruction[]) {
  const rows = [];
  for (const pseudoInstruction of pseudoInstructions) {
    const mnemonic = pseudoInstruction.getMnemonic();
    const mnemonicString = Formatter.decorateTextWithLink(`*${mnemonic}`, `./details#${mnemonic}`);
    const instructionString = Formatter.escapeHTML(
      Formatter.joinMnemonicWithOperands(
        mnemonic,
        pseudoInstruction.getOperands().map((operand) => operand.getName()),
      ),
    );
    const mappedInstructionString = await Formatter.joinAndDecorateMappedInstructionsWithLink(
      pseudoInstruction.getMappedInstructions().map((instr) => {
        return instr.instanceString();
      }),
    );

    rows.push([mnemonicString, instructionString, mappedInstructionString]);
  }

  return rows;
}

fillOverviewTables();
