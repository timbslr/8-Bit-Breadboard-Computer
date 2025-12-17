export default class Statistics {
  static countCharsInString(string, char) {
    return [...string].filter((c) => c === char).length;
  }

  static countMicroinstructionsWithoutRSC(microinstructionsArray) {
    const length = microinstructionsArray.length;
    if (microinstructionsArray[length - 1].includes("RSC")) {
      return length - 1;
    }
    return length;
  }
}
