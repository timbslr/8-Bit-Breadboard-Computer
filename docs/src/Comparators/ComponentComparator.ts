import { COMPONENT_TYPES, parseComponent } from "../Parser/ComponentParser.js";
import { Comparator } from "./Comparator.js";

const TYPE_RANKING = [
  COMPONENT_TYPES.RESISTOR,
  COMPONENT_TYPES.CAPACITOR,
  COMPONENT_TYPES.IC7400,
  COMPONENT_TYPES.IC_MEMORY,
  COMPONENT_TYPES.IC_Other,
  COMPONENT_TYPES.Other,
]; //smaller index means that it appears before the others

export default class ComponentComparator implements Comparator<string> {
  compare(componentA: string, componentB: string): number {
    const unifiedComponentA = parseComponent(componentA);
    const unifiedComponentB = parseComponent(componentB);

    if (unifiedComponentA.type === unifiedComponentB.type) {
      return Number(unifiedComponentA.value) - Number(unifiedComponentB.value);
    }

    return TYPE_RANKING.indexOf(unifiedComponentA.type) - TYPE_RANKING.indexOf(unifiedComponentB.type);
  }
}
