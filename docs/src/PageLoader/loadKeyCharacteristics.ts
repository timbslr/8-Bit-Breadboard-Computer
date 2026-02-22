import DataProvider from "../DataProvider.js";
import { parseComponent } from "../Parser/ComponentParser.js";
import { AmountOfICsStatistic } from "../Statistics/AmountOfICsStatistic.js";
import { AverageCPIStatistic } from "../Statistics/AverageCPIStatistic.js";
import { InstructionCountStatistic } from "../Statistics/InstructionCountStatistic.js";

const instructions = await DataProvider.getInstructions();

const instructionCountStatistic = new InstructionCountStatistic(instructions);
const instructionCountTD = document.getElementById("amount-of-instructions") as HTMLElement;
instructionCountTD.textContent = instructionCountStatistic.formatted();

const averageCPIStatistic = new AverageCPIStatistic(instructions);
const averageCPITD = document.getElementById("average-cpi") as HTMLElement;
averageCPITD.textContent = averageCPIStatistic.formatted();

const rawComponents = await DataProvider.getPartListFromFile("ALL");
const parsedComponents = new Map();
for (const [description, data] of rawComponents) {
  const component = parseComponent(description);
  parsedComponents.set(component, data.quantity);
}
const amountOfICsStatistic = new AmountOfICsStatistic(parsedComponents);
const amountOfICsTD = document.getElementById("amount-of-ics") as HTMLElement;
amountOfICsTD.textContent = amountOfICsStatistic.formatted();
