import DataProvider from "../DataProvider.js";
import { InstructionCountStatistic } from "../Statistics/InstructionCountStatistic.js";

const instructions = await DataProvider.getInstructions();
const instructionCountStatistic = new InstructionCountStatistic(instructions);

const instructionCountTD = document.getElementById("amount-of-instructions") as HTMLElement;
instructionCountTD.textContent = instructionCountStatistic.formatted();
