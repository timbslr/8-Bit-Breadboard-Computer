#include <format>
#include <unordered_set>
#include "./RuleBuilder.cpp"
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
RuleBuilder rb(ASSIGN_OPERATOR_INDEX);
const string RULES_FILE_PATH = "../asm/rules.asm";

void appendRule(json& instruction);
string stripOpcode(string opcode);
void appendMovRules(json& instruction);
void appendTernaryPartOfMovRule(map<string, map<string, string>> dataForRegdRegsMovRule);
vector<string> generateLeftSideOperands(vector<string> operands);
vector<string> generateRightSideOperands(string opcode, vector<string> operands);
string concatPseudoInstructions(string mnemonic, vector<string> mappedInstructions);
string escapeForCustomAsm(string s);
void appendSyntacticSugarRules(unordered_map<string, string> opcodes);

int main() {
  json instructions = getJSONFromFile("../docs/resources/data/instructionData.jsonc")["instructions"];
  unordered_map<string, string> opcodes;

  rb.indent(1);
  for(json& instruction : instructions) {
    appendRule(instruction);
    bool isInstructionReal = string(instruction["type"]) == "REAL";

    if(isInstructionReal) {
      string opcode = instruction["opcode"];
      opcodes[instruction["mnemonic"]] = stripOpcode(opcode);
    }
  }

  appendSyntacticSugarRules(opcodes);

  duplicateFile("rulesTemplate.asm", RULES_FILE_PATH);
  replaceAllInFile(RULES_FILE_PATH, "\t<RULES>" , rb.build());

  string registerBinMapString = "";
  for (const auto& [reg, bin] : registerBinMap) {
    registerBinMapString += format("\t{:<4} => {}\n", reg, bin);
  }
  registerBinMapString.pop_back();  //remove last \n
  replaceAllInFile(RULES_FILE_PATH, "\t<REGISTER_BIN_MAP>", registerBinMapString);

  return 0;
}

void appendRule(json& instruction) {
  string mnemonic = string(instruction["mnemonic"]);
  vector<string> operands = instruction["operands"];
  bool isInstructionReal = string(instruction["type"]) == "REAL";
  if(mnemonic == "mov") {
    appendMovRules(instruction);
    return;
  }

  vector<string> leftSideOperands = generateLeftSideOperands(operands);
  rb.partialRuleHeader(mnemonic + " " + concatVectorElements(leftSideOperands, ", "));

  if(isInstructionReal) {
    string opcode = instruction["opcode"];
    vector<string> rightSideOperands = generateRightSideOperands(opcode, operands);

    //remove empty strings
    rightSideOperands.erase(
      remove(rightSideOperands.begin(), rightSideOperands.end(), ""),
      rightSideOperands.end()
    );

    rb.endLine(concatVectorElements(rightSideOperands, " @ "));
  } else {
    vector<string> mappedInstructions = instruction["mappedInstructions"];
    rb.endLine(concatPseudoInstructions(mnemonic, mappedInstructions));
  }
}

string stripOpcode(string opcode) {
  replaceAll(opcode, "R", "");
  replaceAll(opcode, "L", "");
  replaceAll(opcode, "X", "");
  return opcode;
}

void appendMovRules(json& instruction) {
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
    rb.ruleHeader(format("mov {}, {}", destinationRegister, sourceRegister), "0b" + opcode);
  }
  
  appendTernaryPartOfMovRule(dataForRegdRegsMovRule);
}

// dataForRegdRegsMovRule is grouped by destination
void appendTernaryPartOfMovRule(map<string, map<string, string>> dataForRegdRegsMovRule) {
  rb.ruleHeader(format("mov {}, {}", REGISTER_ARGUMENT("regd"), REGISTER_ARGUMENT("regs")), "");
  rb.openScope();
  rb.line("regd == regs ? 0b0`0 : ; optimization: if registers are the same, don't emit an instruction");

  for (const auto& [regd, value] : dataForRegdRegsMovRule) {
    rb.line(format("regd == {} ? (", registerBinMap.at(regd)));
    rb.indent(1);
    for (const auto& [regs, opcode] : value) {
      rb.line(format("regs == {} ? 0b{}`8 :", registerBinMap.at(regs), opcode));
    }
    rb.line("assert(false, \"Invalid mov combination found!\")");
    rb.indent(-1);
    rb.line(") :");
  }

  rb.line("assert(false, \"Invalid mov combination found!\")");
  rb.closeScope();
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
    RuleBuilder localRb;
    localRb.endLine();
    localRb.indent(1);
    localRb.openScope("asm");
    for(const string& s : mappedInstructions) {
      localRb.line(s);
    }
    localRb.line("nextInstructionAddress:");
    localRb.closeScope();
    return localRb.build();
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

void appendSyntacticSugarRules(unordered_map<string, string> opcodes) {
  rb.line("\n\t; Syntactic Sugar Rules:");
  rb.ruleHeader(format("ld {}, {}[{}]", REGISTER_ARGUMENT("reg"), INDXREGISTER_ARGUMENT("idxreg"), ADDRESS_ARGUMENT("addr")), "asm{ ldo {reg}, {idxreg}, {addr} }");
  rb.ruleHeader(format("st {}, {}[{}]", REGISTER_ARGUMENT("reg"), INDXREGISTER_ARGUMENT("idxreg"), ADDRESS_ARGUMENT("addr")), "asm{ sto {reg}, {idxreg}, {addr} }");
  rb.ruleHeader(format("ld {}, {}[SP]", REGISTER_ARGUMENT("reg"), IMMEDIATE_ARGUMENT("imm")), "asm{ ldsprel {reg}, {imm} }");
  rb.ruleHeader(format("st {}, {}[SP]", REGISTER_ARGUMENT("reg"), IMMEDIATE_ARGUMENT("imm")), "asm{ stsprel {reg}, {imm} }");
  rb.ruleHeader("jmp [A, TMP]", "asm{ jmpr } ");
  rb.ruleHeader(format("jmp ({})", ADDRESS_ARGUMENT("addr")), "asm{ jmpind {addr} }");

  const string binaryALUInstructions[] = {"add", "addc", "sub", "subc", "and", "or", "xor"};
  const string unaryALUInstructions[] = {"addi", "addci", "subci", "andi", "ori", "xori", "not", "negate", "shl", "slr", "sar", "ror", "rol"};

  for(const string& mnemonic : binaryALUInstructions) {
    string leftSide = format("{} {}, {}, {}", mnemonic, REGISTER_ARGUMENT("reg1"), REGISTER_ARGUMENT("reg2"), REGISTER_ARGUMENT("reg3"));
    rb.partialRuleHeader(leftSide);
    rb.endLine();
    rb.openScope();
    rb.line("reg3 == 0b000 && reg2 != 0b000 ?  ; if reg3 is A (and reg2 is not A), it would be overwritten before the value can be read");
    rb.line("asm{ mov BUF, {reg3} } @ asm{ mov A, {reg2} } @ asm{ mov TMP, BUF } @ asm{ " + mnemonic + " } @ asm{ mov {reg1}, A } : ; so cache it in the BUF-Register");
    rb.line("asm{ mov A, {reg2} } @ asm{ mov TMP, {reg3} } @ asm{ " + mnemonic + " } @ asm{ mov {reg1}, A }");
    rb.closeScope();
  }

  for(const string& mnemonic : unaryALUInstructions) {
    const bool isImmediateInstruction = mnemonic.back() == 'i';
    if(isImmediateInstruction) {
      string leftSide = format("{} {}, {}, {}", mnemonic, REGISTER_ARGUMENT("reg1"), REGISTER_ARGUMENT("reg2"), IMMEDIATE_ARGUMENT("imm"));
      string rightSide = "asm{ mov A, {reg2} } @ asm{ " + mnemonic + " {imm} } @ asm{ mov {reg1}, A }";
      rb.ruleHeader(leftSide, rightSide);
    }  else {
      string leftSide = format("{} {}, {}", mnemonic, REGISTER_ARGUMENT("reg1"), REGISTER_ARGUMENT("reg2"));
      string rightSide = "asm{ mov A, {reg2} } @ asm{ " + mnemonic + " } @ asm{ mov {reg1}, A }";
      rb.ruleHeader(leftSide, rightSide);
    }
    continue;
  }
}
