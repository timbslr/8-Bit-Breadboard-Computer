#include <format>
#include <unordered_set>
#include "../lib/fileUtils.cpp"
#include "../lib/utils.cpp"
#include "../lib/json.hpp"

using json = nlohmann::json;
using namespace std;

#define REGISTER_ARGUMENT(specifier)  (string("{") + specifier + ": register}")
#define LCDREGISTER_ARGUMENT(specifier)  (string("{") + specifier + ": lcdregister}")
#define INDXREGISTER_ARGUMENT(specifier) ((string("{") + specifier + ": idxregister}"))
#define IMMEDIATE_ARGUMENT(specifier) (string("{") + specifier + ": i8}")
#define ADDRESS_ARGUMENT(specifier)   (string("{") + specifier + ": u16}")

const string registers[] = {"A", "TMP", "B", "C", "X", "Y"};
const map<string, string> registerBinMap = {
  {"A",   "0b000"},
  {"TMP", "0b001"},
  {"B",   "0b010"},
  {"C",   "0b011"},
  {"X",   "0b100"},
  {"Y",   "0b101"},
};
const unordered_map<string, string> leftSideOperandsMap = {
  {"reg", REGISTER_ARGUMENT("reg")},
  {"regd", REGISTER_ARGUMENT("regd")},
  {"regs", REGISTER_ARGUMENT("regs")},
  {"idxreg", INDXREGISTER_ARGUMENT("idxreg")},
  {"lcdreg", LCDREGISTER_ARGUMENT("lcdreg")},
  {"imm", IMMEDIATE_ARGUMENT("imm")},
  {"addr", ADDRESS_ARGUMENT("addr")}
};

const int ASSIGN_OPERATOR_INDEX = 57;

string generateRule(json& instruction);
string stripOpcode(string opcode);
string handleSpecialCaseMov(json& instruction);
string generateRegdRegsMovRule(map<string, map<string, string>> dataForRegdRegsMovRule);
vector<string> generateLeftSideOperands(vector<string> operands);
vector<string> generateRightSideOperands(string opcode, vector<string> operands);
string concatPseudoInstructions(string mnemonic, vector<string> mappedInstructions);
string escapeForCustomAsm(string s);
vector<string> generateSyntacticSugarRules(unordered_map<string, string> opcodes);
string createFormattedRule(string leftSide, string rightSide);

int main() {
  json instructions = getJSONFromFile("../docs/resources/data/instructionData.jsonc")["instructions"];
  vector<string> rules;
  unordered_map<string, string> opcodes;

  for(json& instruction : instructions) {
    string currentRule = generateRule(instruction);
    bool isInstructionReal = string(instruction["type"]) == "REAL";

    if(isInstructionReal) {
      string opcode = instruction["opcode"];
      opcodes[instruction["mnemonic"]] = stripOpcode(opcode);
    }

    stringstream ss(currentRule);
    string singleRuleString;
    while(getline(ss, singleRuleString, '\n')) {
      rules.push_back(singleRuleString);
    }
  }

  vector<string> syntacticSugarRules = generateSyntacticSugarRules(opcodes);
  rules.insert(rules.end(), syntacticSugarRules.begin(), syntacticSugarRules.end());

  string rulesString = concatVectorElements(rules, "\n");

  duplicateFile("rulesTemplate.asm", "rules.asm");
  replaceAllInFile("rules.asm", "\t<RULES>" , rulesString);

  string registerBinMapString = "";
  for (const auto& [reg, bin] : registerBinMap) {
    registerBinMapString += format("\t{:<4} => {}\n", reg, bin);
  }
  registerBinMapString.pop_back();  //remove last \n
  replaceAllInFile("rules.asm", "\t<REGISTER_BIN_MAP>", registerBinMapString);

  return 0;
}

string generateRule(json& instruction) {
  string mnemonic = string(instruction["mnemonic"]);
  vector<string> operands = instruction["operands"];
  bool isInstructionReal = string(instruction["type"]) == "REAL";
  if(mnemonic == "mov") {
    return handleSpecialCaseMov(instruction);
  }

  vector<string> leftSideOperands = generateLeftSideOperands(operands);
  string rule = createFormattedRule(mnemonic + " " + concatVectorElements(leftSideOperands, ", "), "");

  if(isInstructionReal) {
    string opcode = instruction["opcode"];
    vector<string> rightSideOperands = generateRightSideOperands(opcode, operands);

    //remove empty strings
    rightSideOperands.erase(
      remove(rightSideOperands.begin(), rightSideOperands.end(), ""),
      rightSideOperands.end()
    );

    rule += concatVectorElements(rightSideOperands, " @ ");
  } else {
    vector<string> mappedInstructions = instruction["mappedInstructions"];
    rule += concatPseudoInstructions(mnemonic, mappedInstructions);
  }

  return rule;
}

string stripOpcode(string opcode) {
  replaceAll(opcode, "R", "");
  replaceAll(opcode, "L", "");
  replaceAll(opcode, "X", "");
  return opcode;
}

string handleSpecialCaseMov(json& instruction) {
  json movData = getJSONFromFile("../docs/resources/data/movData.json");
  vector<string> movRules;
  map<string, map<string, string>> dataForRegdRegsMovRule;

  for(const json& currentData : movData) {
    string opcode = currentData["opcode"];
    string sourceRegister = currentData["from"];
    string destinationRegister = currentData["to"];

    bool containsSourceRegister = find(begin(registers), end(registers), sourceRegister) != end(registers);
    bool containsDestinationRegister = find(begin(registers), end(registers), destinationRegister) != end(registers);
    if(containsSourceRegister && containsDestinationRegister) {
      //if the destination and source are of type "register", they'll be later added as part of a general mov rule for general registers
      dataForRegdRegsMovRule[destinationRegister][sourceRegister] = opcode;
      continue;
    }

    // else it's a special rule and it's handled separately (e.g. a mov from the Flags-Register)
    movRules.push_back(createFormattedRule(format("mov {}, {}", destinationRegister, sourceRegister), "0b" + opcode));
  }

  movRules.push_back(generateRegdRegsMovRule(dataForRegdRegsMovRule));
  return concatVectorElements(movRules, "\n");
}

// dataForRegdRegsMovRule is grouped by destination
string generateRegdRegsMovRule(map<string, map<string, string>> dataForRegdRegsMovRule) {
  string rule = createFormattedRule(format("mov {}, {}", REGISTER_ARGUMENT("regd"), REGISTER_ARGUMENT("regs")), "\n\t\t{\n");
  rule += "\t\t\tregd == regs ? 0b0`0 : ; optimization: if registers are the same, don't emit an instruction\n";

  for (const auto& [regd, value] : dataForRegdRegsMovRule) {
    rule += format("\t\t\tregd == {} ? (\n", registerBinMap.at(regd));
    for (const auto& [regs, opcode] : value) {
        rule += format("\t\t\t\tregs == {} ? 0b{}`8 :\n", registerBinMap.at(regs), opcode);
    }
    rule += "\t\t\t\tassert(false, \"Invalid mov combination found!\")\n";
    rule += "\t\t\t) :\n";
  }

  rule += "\t\t\tassert(false, \"Invalid mov combination found!\")\n";
  rule += "\t\t}\n";
  return rule;
}

vector<string> generateLeftSideOperands(vector<string> operands) {
    vector<string> leftSideOperands;

    for(const string& operand : operands) {
      auto it = leftSideOperandsMap.find(operand);
      if(it != leftSideOperandsMap.end()) {
        leftSideOperands.push_back(it->second);
      } else {
        cerr << "No left side operands matching: " << operand << endl;
      }
    }

    return leftSideOperands;
}

vector<string> generateRightSideOperands(string opcode, vector<string> operands) {
  vector<string> rightSideOperands;
  
  int currentOperandIndex = 0;
  vector<bool> currentOpcodePieces;

  //append operands that occur in the opcode
  for(int i = 0; i < opcode.size(); i++) {
    char c = opcode[i];
    if(c == '0' || c == '1') {
      currentOpcodePieces.push_back(c == '1');
      continue;
    }

    rightSideOperands.push_back(createBinString(currentOpcodePieces));
    currentOpcodePieces.clear();
    switch(c) {
      case 'L': 
        rightSideOperands.push_back("lcdreg");
        break;
      case 'X': 
        rightSideOperands.push_back("idxreg");
        break;
      case 'R': 
        rightSideOperands.push_back("reg");
        i += 2;
        break;
      default: 
        cerr << "Found invalid symbol in opcode: " << c << endl;
        break;
    }
    currentOperandIndex++;
  }

  if(currentOpcodePieces.size() > 0) {
    rightSideOperands.push_back(createBinString(currentOpcodePieces));
  }
  
  //append rest of operands
  for(int i = currentOperandIndex; i < operands.size(); i++) {
    string operand = operands[i];
    rightSideOperands.push_back(operand == "addr" ? "le(addr)" : operand);
  }

  return rightSideOperands;
}

string concatPseudoInstructions(string mnemonic, vector<string> mappedInstructions) {
  if(mnemonic == "call") {
    mappedInstructions.push_back("nextInstructionAddress:");
    return "\n\t\tasm{\n\t\t\t" + concatVectorElements(mappedInstructions, "\n\t\t\t") + "\n\t\t}";
  }

  for(string& instr : mappedInstructions) {
    instr = "asm{ " + escapeForCustomAsm(instr) + " }";
  }

  return concatVectorElements(mappedInstructions, " @ ");
}

string escapeForCustomAsm(string s) {
  replaceAll(s, "<", "{");  //replace argument brackets that exist in mapped instructions, customasm needs curly braces for that
  replaceAll(s, ">", "}");
  return s;
}

vector<string> generateSyntacticSugarRules(unordered_map<string, string> opcodes) {
  vector<string> syntacticSugarRules;
  syntacticSugarRules.push_back("\n\t; Syntactic Sugar Rules:");
  syntacticSugarRules.push_back(createFormattedRule(format("ld {}, {}[{}]", REGISTER_ARGUMENT("reg"), INDXREGISTER_ARGUMENT("idxreg"), ADDRESS_ARGUMENT("addr")), "asm{ ldo {reg}, {idxreg}, {addr} }"));
  
  syntacticSugarRules.push_back(createFormattedRule(format("st {}, {}[{}]", REGISTER_ARGUMENT("reg"), INDXREGISTER_ARGUMENT("idxreg"), ADDRESS_ARGUMENT("addr")), "asm{ sto {reg}, {idxreg}, {addr} }"));
  syntacticSugarRules.push_back(createFormattedRule(format("ld {}, {}[SP]", REGISTER_ARGUMENT("reg"), IMMEDIATE_ARGUMENT("imm")), "asm{ ldsprel {reg}, {imm} }"));
  syntacticSugarRules.push_back(createFormattedRule(format("st {}, {}[SP]", REGISTER_ARGUMENT("reg"), IMMEDIATE_ARGUMENT("imm")), "asm{ stsprel {reg}, {imm} }"));

  syntacticSugarRules.push_back(createFormattedRule("jmp [A, TMP]", "asm{ jmpr } "));
  syntacticSugarRules.push_back(createFormattedRule(format("jmp ({})", ADDRESS_ARGUMENT("addr")), "asm{ jmpind {addr} }"));

  const string binaryALUInstructions[] = {"add", "addc", "sub", "subc", "and", "or", "xor"};
  const string unaryALUInstructions[] = {"addi", "addci", "subci", "andi", "ori", "xori", "not", "negate", "shl", "slr", "sar", "ror", "rol"};

  for(const string& mnemonic : binaryALUInstructions) {
    string leftSide = format("{} {}, {}, {}", mnemonic, REGISTER_ARGUMENT("reg1"), REGISTER_ARGUMENT("reg2"), REGISTER_ARGUMENT("reg3"));

    string rightSide = format(R"(
    {{
      reg3 == 0b000 && reg2 != 0b000 ?  ; if reg3 is A (and reg2 is not A), it would be overwritten before the value can be read
      asm{{ mov BUF, {{reg3}} }} @ asm{{ mov A, {{reg2}} }} @ asm{{ mov TMP, BUF }} @ asm{{ {} }} @ asm{{ mov {{reg1}}, A }} : ; so cache it in the BUF-Register
      asm{{ mov A, {{reg2}} }} @ asm{{ mov TMP, {{reg3}} }} @ asm{{ {} }} @ asm{{ mov {{reg1}}, A }}
    }})", mnemonic, mnemonic);

    syntacticSugarRules.push_back(createFormattedRule(leftSide, rightSide));
  }

  for(const string& mnemonic : unaryALUInstructions) {
    const bool isImmediateInstruction = mnemonic.back() == 'i';
    if(isImmediateInstruction) {
      string leftSide = format("{} {}, {}, {}", mnemonic, REGISTER_ARGUMENT("reg1"), REGISTER_ARGUMENT("reg2"), IMMEDIATE_ARGUMENT("imm"));
      string rightSide = format("asm{{ mov A, {{reg2}} }} @ asm{{ {} {{imm}} }} @ asm{{ mov {{reg1}}, A }}", mnemonic);
      syntacticSugarRules.push_back(createFormattedRule(leftSide, rightSide));
    }  else {
      string leftSide = format("{} {}, {}", mnemonic, REGISTER_ARGUMENT("reg1"), REGISTER_ARGUMENT("reg2"));
      string rightSide = format("asm{{ mov A, {{reg2}} }} @ asm{{ {} }} @ asm{{ mov {{reg1}}, A }}", mnemonic);
      syntacticSugarRules.push_back(createFormattedRule(leftSide, rightSide));
    }
    continue;
  }

  return syntacticSugarRules;
}

string createFormattedRule(string leftSide, string rightSide) {
  return format("\t{:<{}} => {}", leftSide, ASSIGN_OPERATOR_INDEX, rightSide);
}
