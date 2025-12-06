import { parseJSONC } from "./Parser/JSONCParser.js";
import BOMFileParser from "./Parser/BOMFileParser.js";
import "./MapExtension.js";

export default class DataProvider {
  static #instructions;
  static #controlBits;

  static async getInstructions() {
    if (!this.#instructions) {
      this.#instructions = (await this.#getObjectFromJSONFile("../resources/data/instructionData.jsonc")).instructions;
    }

    return this.#instructions;
  }

  static async getControlBits() {
    if (!this.#controlBits) {
      this.#controlBits = (await this.#getObjectFromJSONFile("./resources/data/controlBits.json")).controlBits;
    }

    return this.#controlBits;
  }

  static async getBOMFromFile(filePath) {
    if (filePath === "ALL") {
      let contentMap = new Map();
      const files = await this.#getObjectFromJSONFile("./resources/BOMs/files.json");
      for (const file of files) {
        const fileSpecificContentMap = await BOMFileParser.getContentMapFromFile("./resources/BOMs/" + file);
        contentMap = contentMap.concatBySum(fileSpecificContentMap);
      }
      return contentMap;
    }

    return await BOMFileParser.getContentMapFromFile(filePath);
  }

  static async #getObjectFromJSONFile(filePath) {
    const response = await fetch(filePath);
    return parseJSONC(await response.text());
  }
}
