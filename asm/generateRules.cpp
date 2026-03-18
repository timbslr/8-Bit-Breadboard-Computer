#include <iostream>
#include <fstream>
#include <format>
#include <unordered_set>
#include "../lib/json.hpp"

using json = nlohmann::json;
using namespace std;

#define REGISTER_ARGUMENT(specifier)  ("{" specifier ": register}")
#define LCDREGISTER_ARGUMENT(specifier)  ("{" specifier ": lcdregister}")
#define INDXREGISTER_ARGUMENT(specifier) (("{" specifier ": idxregister}"))
#define IMMEDIATE_ARGUMENT(specifier) ("{" specifier ": i8}")
#define ADDRESS_ARGUMENT(specifier)   ("{" specifier ": u16}")

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

json getJSONFromFile(string filePath);
string generateRule(auto instruction);
string handleSpecialCaseMov(auto instruction);
string generateRegdRegsMovRule(map<string, map<string, string>> dataForRegdRegsMovRule);
vector<string> generateLeftSideOperands(vector<string> operands);
vector<string> generateRightSideOperands(vector<string> operands);
string concatPseudoInstructions(string mnemonic, vector<string> mappedInstructions);
string formatRules(vector<string> rules);
void writeRulesToFile(string filePath, string templatePath, string rulesString);
string concatVectorElements(vector<string> v, string delimiter);
vector<string> generateSyntacticSugarRules(unordered_map<string, string> opcodes);
void replaceAll(string &str, const string &from, const string &to);

int main() {
  json instructions = getJSONFromFile("../docs/resources/data/instructionData.jsonc")["instructions"];
  vector<string> rules;

  int maxIndexOfAssignOperator = -1;
  unordered_map<string, string> opcodes;

  for(int i = 0; i < instructions.size(); i++) {
    auto currentInstruction = instructions[i];
    string currentRule = generateRule(currentInstruction);

    if(currentInstruction.contains("opcode")) {
      string opcode = currentInstruction["opcode"];
      replaceAll(opcode, "R", "");
      replaceAll(opcode, "L", "");
      replaceAll(opcode, "X", "");
      replaceAll(currentRule, "<opcode>", opcode);
      opcodes[currentInstruction["mnemonic"]] = opcode;
    }

    stringstream ss(currentRule);
    string singleRuleString;
    while(getline(ss, singleRuleString, '\n')) {
      rules.push_back(singleRuleString);
    }
  }

  vector<string> syntacticSugarRules = generateSyntacticSugarRules(opcodes);
  rules.insert(rules.end(), syntacticSugarRules.begin(), syntacticSugarRules.end());

  string rulesString = formatRules(rules);
  writeRulesToFile("rules.asm", "./rulesTemplate.asm", rulesString);

  return 0;
}

json getJSONFromFile(string filePath) {
  ifstream jsonFile(filePath);
  return json::parse(jsonFile, nullptr, true, true);
}

string generateRule(auto instruction) {
  vector<string> operands = instruction["operands"];
  string mnemonic = string(instruction["mnemonic"]);
  bool isInstructionReal = string(instruction["type"]) == "REAL";
  if(mnemonic == "mov") {
    return handleSpecialCaseMov(instruction);
  }

  vector<string> leftSideOperands = generateLeftSideOperands(operands);
  string rule = format("{} {} => ", mnemonic, concatVectorElements(leftSideOperands, ", "));

  if(isInstructionReal) {
    rule += "0b<opcode>";

    if(operands.size() == 0) return rule;

    vector<string> rightSideOperands = generateRightSideOperands(operands);
    rule += " @ " + concatVectorElements(rightSideOperands, " @ ");;
    return rule;
  }

  vector<string> mappedInstructions = instruction["mappedInstructions"];
  rule += concatPseudoInstructions(mnemonic, mappedInstructions);

  return rule;
}

string handleSpecialCaseMov(auto instruction) {
  json movData = getJSONFromFile("../docs/resources/data/movData.json");
  vector<string> movRules;
  map<string, map<string, string>> dataForRegdRegsMovRule;

  for(const auto currentData : movData) {
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
    movRules.push_back(format("mov {}, {} => 0b{}", destinationRegister, sourceRegister, opcode));
  }

  movRules.push_back(generateRegdRegsMovRule(dataForRegdRegsMovRule));
  return concatVectorElements(movRules, "\n");
}

// dataForRegdRegsMovRule is grouped by destination
string generateRegdRegsMovRule(map<string, map<string, string>> dataForRegdRegsMovRule) {
    string rule = format("mov {}, {} =>\n{{\n", REGISTER_ARGUMENT("regd"), string(REGISTER_ARGUMENT("regs")));
    rule += "\tregd == regs ? 0b0`0 : ; optimization: if registers are the same, don't emit an instruction\n";

    for (const auto& [regd, value] : dataForRegdRegsMovRule) {
      rule += format("\tregd == {} ? (\n", registerBinMap.at(regd));
      for (const auto& [regs, opcode] : value) {
          rule += format("\t\tregs == {} ? 0b{}`8 :\n", registerBinMap.at(regs), opcode);
      }
      rule += "\t\tassert(false, \"Invalid mov combination found!\")\n";
      rule += "\t) :\n";
    }

    rule += "\tassert(false, \"Invalid mov combination found!\")\n";
    rule += "}\n";
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

vector<string> generateRightSideOperands(vector<string> operands) {
  vector<string> rightSideOperands;

  for(const string& operand : operands) {
    rightSideOperands.push_back(operand == "addr" ? "le(addr)" : operand);
  }

  return rightSideOperands;
}

string concatPseudoInstructions(string mnemonic, vector<string> mappedInstructions) {
  if(mnemonic == "call") {  //handle special case call, in this representation of mnemonic, every mnemonic has a space behind its name
    mappedInstructions.push_back("nextInstructionAddress:");
    return "\nasm{\n\t" + concatVectorElements(mappedInstructions, "\n\t") + "\n}";
  }

  for(string& instr : mappedInstructions) {
    replaceAll(instr, "<", "{");  //replace argument brackets that exist in mapped instructions, customasm needs curly braces for that
    replaceAll(instr, ">", "}");
    instr = "asm{ " + instr + " }";
  }

  return concatVectorElements(mappedInstructions, " @ ");
}

string formatRules(vector<string> rules) {  
  const string ASSIGN_LINE_PREFIX = "\t";
  const string NO_ASSIGN_LINE_PREFIX = "\t\t";

  size_t maxIndexOfAssignOperator = 0;
  for(const string& rule : rules) {
    size_t indexOfAssignOperator = rule.find("=>");
    if(indexOfAssignOperator != string::npos) {
      maxIndexOfAssignOperator = max(maxIndexOfAssignOperator, indexOfAssignOperator);
    }
  }

  for(string& rule : rules) {
    size_t indexOfAssignOperator = rule.find("=>");
    if(indexOfAssignOperator == string::npos) {
      rule.insert(0, NO_ASSIGN_LINE_PREFIX);
      continue;
    }

    size_t alignmentPadding = maxIndexOfAssignOperator - indexOfAssignOperator;
    rule.insert(indexOfAssignOperator, alignmentPadding, ' ');
    rule.insert(0, ASSIGN_LINE_PREFIX);
  }

  return concatVectorElements(rules, "\n");
}

void writeRulesToFile(string filePath, string templatePath, string rulesString) {
  ifstream templateFile(templatePath);
  string fileContent((istreambuf_iterator<char>(templateFile)),istreambuf_iterator<char>());
  replaceAll(fileContent, "\t<RULES>", rulesString);

  ofstream outputFileStream(filePath);
  outputFileStream.write(fileContent.c_str(), fileContent.length());
  outputFileStream.close();
}

string concatVectorElements(vector<string> v, string delimiter) {
  string result = "";
  for(int i = 0; i < v.size(); i++) {
    if(i != 0) result += delimiter;

    result += v[i];
  }
  return result;
}

vector<string> generateSyntacticSugarRules(unordered_map<string, string> opcodes) {
  vector<string> syntacticSugarRules;
  syntacticSugarRules.push_back("\n\t; Syntactic Sugar Rules:");
  syntacticSugarRules.push_back(format("ld {}, {}[{}] => asm{{ ldo {{reg}}, {{idxreg}}, {{addr}}  }} ", REGISTER_ARGUMENT("reg"), INDXREGISTER_ARGUMENT("idxreg"), ADDRESS_ARGUMENT("addr")));
  syntacticSugarRules.push_back(format("st {}, {}[{}] => asm{{ sto {{reg}}, {{idxreg}}, {{addr}}  }} ", REGISTER_ARGUMENT("reg"), INDXREGISTER_ARGUMENT("idxreg"), ADDRESS_ARGUMENT("addr")));
  
  syntacticSugarRules.push_back(format("ld {}, {}[SP] => asm{{ ldsprel {{reg}}, {{imm}} }} ", REGISTER_ARGUMENT("reg"), IMMEDIATE_ARGUMENT("imm")));
  syntacticSugarRules.push_back(format("st {}, {}[SP] => asm{{ stsprel {{reg}}, {{imm}} }} ", REGISTER_ARGUMENT("reg"), IMMEDIATE_ARGUMENT("imm")));

  syntacticSugarRules.push_back("jmp [A, TMP] => asm{ jmpr } ");
  syntacticSugarRules.push_back(format("jmp ({}) => asm{{ jmpind {{addr}} }}", ADDRESS_ARGUMENT("addr")));

  const string binaryALUInstructions[] = {"add", "addc", "sub", "subc", "and", "or", "xor"};
  const string unaryALUInstructions[] = {"addi", "addci", "subci", "andi", "ori", "xori", "not", "negate", "shl", "slr", "sar", "ror", "rol"};

  for(const string& mnemonic : binaryALUInstructions) {
    string subRule = format(R"({} {}, {}, {} => 
    {{
      reg3 == 0b000 && reg2 != 0b000 ?  ; if reg3 is A (and reg2 is not A), it would be overwritten before the value can be read
      asm{{ mov BUF, {{reg3}} }} @ asm{{ mov A, {{reg2}} }} @ asm{{ mov TMP, BUF }} @ asm{{ {} }} @ asm{{ mov {{reg1}}, A }} : ; so cache it in the BUF-Register
      asm{{ mov A, {{reg2}} }} @ asm{{ mov TMP, {{reg3}} }} @ asm{{ {} }} @ asm{{ mov {{reg1}}, A }}
    }})", mnemonic, REGISTER_ARGUMENT("reg1"), REGISTER_ARGUMENT("reg2"), REGISTER_ARGUMENT("reg3"), mnemonic, mnemonic);

    syntacticSugarRules.push_back(subRule);
  }

  for(const string& mnemonic : unaryALUInstructions) {
    const bool isImmediateInstruction = mnemonic.back() == 'i';
    if(isImmediateInstruction) {
      syntacticSugarRules.push_back(format("{} {}, {}, {} => asm{{ mov A, {{reg2}} }} @ asm{{ {} {{imm}} }} @ asm{{ mov {{reg1}}, A }}", mnemonic, REGISTER_ARGUMENT("reg1"), REGISTER_ARGUMENT("reg2"), IMMEDIATE_ARGUMENT("imm"), mnemonic));
    }  else {
      syntacticSugarRules.push_back(format("{} {}, {} => asm{{ mov A, {{reg2}} }} @ asm{{ {} }} @ asm{{ mov {{reg1}}, A }}", mnemonic, REGISTER_ARGUMENT("reg1"), REGISTER_ARGUMENT("reg2"), mnemonic));
    }
    continue;
  }

  return syntacticSugarRules;
}

void replaceAll(string &str, const string &from, const string &to) {
  int pos = 0;
  while ((pos = str.find(from, pos)) != string::npos) {
    str.replace(pos, from.length(), to);
    pos += to.length();
  }
}