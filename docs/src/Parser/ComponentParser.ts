const DECIMAL_REGEX = /(\d+(?:\.\d+)?)/; // DIGITS.DIGITS, captured inside a group
const RESISTOR_REGEX = new RegExp(`${DECIMAL_REGEX.source}(Ω|kΩ|MΩ) Resistor`);
const CAPACITOR_REGEX = new RegExp(`${DECIMAL_REGEX.source}(F|mF|µF|uF|nF|pF) Capacitor`);
const IC7400_REGEX = /(74(?:LS)?\d+).*/;
const IC_MEMORY_REGEX = /(28C\d+|U62\d+).*/;
const IC_OTHER_REGEX = /(LM555).*/;

const RESISTOR_UNIT_MULTIPLIERS = {
  Ω: 1,
  kΩ: 1_000,
  MΩ: 1_000_000,
};

const CAPACITOR_UNIT_MULTIPLIERS = {
  F: 1,
  mF: 10e-3,
  µF: 10e-6,
  uF: 10e-6, //support both notations for "micro"
  nF: 10e-9,
  pF: 10e-12,
};

export const COMPONENT_TYPES = {
  RESISTOR: "Resistor",
  CAPACITOR: "Capacitor",
  IC7400: "IC7400",
  IC_MEMORY: "IC_Memory",
  IC_Other: "IC_Other",
  Other: "Other",
};

type Component = { type: typeof COMPONENT_TYPES; value: string | null };

/**
 * Takes a description for a component (like the one in the BOM-files) and
 * outputs a unified object containing the type and value of the Component
 * @param {string} componentDescription
 */
export function parseComponent(componentDescription: string): Component {
  let match;

  if ((match = componentDescription.match(RESISTOR_REGEX))) {
    return {
      type: COMPONENT_TYPES.RESISTOR,
      value: applyUnitMultiplier(match[1], match[2], RESISTOR_UNIT_MULTIPLIERS),
    };
  }
  if ((match = componentDescription.match(CAPACITOR_REGEX))) {
    return {
      type: COMPONENT_TYPES.CAPACITOR,
      value: applyUnitMultiplier(match[1], match[2], CAPACITOR_UNIT_MULTIPLIERS),
    };
  }
  if ((match = componentDescription.match(IC7400_REGEX))) {
    return { type: COMPONENT_TYPES.IC7400, value: match[1].replace("LS", "") };
  }
  if ((match = componentDescription.match(IC_MEMORY_REGEX))) {
    return { type: COMPONENT_TYPES.IC_MEMORY, value: match[1] };
  }
  if ((match = componentDescription.match(IC_OTHER_REGEX))) {
    return { type: COMPONENT_TYPES.IC_Other, value: match[1] };
  }

  return { type: COMPONENT_TYPES.Other, value: null };
}

function applyUnitMultiplier(value, unit, unitTable) {
  return value * unitTable[unit];
}
