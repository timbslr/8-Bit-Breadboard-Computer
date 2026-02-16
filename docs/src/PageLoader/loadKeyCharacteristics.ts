import DataProvider from "../DataProvider.js";
import { AverageCPIStatistic } from "../Statistics/AverageCPIStatistic.js";
import { InstructionCountStatistic } from "../Statistics/InstructionCountStatistic.js";

const instructions = await DataProvider.getInstructions();
const instructionCountStatistic = new InstructionCountStatistic(instructions);
const averageCPIStatistic = new AverageCPIStatistic(instructions);

const instructionCountTD = document.getElementById("amount-of-instructions") as HTMLElement;
instructionCountTD.textContent = instructionCountStatistic.formatted();

const averageCPITD = document.getElementById("average-cpi") as HTMLElement;
averageCPITD.textContent = averageCPIStatistic.formatted();
