#include <iostream>
#include <fstream>
#include <format>
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

string generateRule(auto instruction);
string handleSpecialCaseMov(auto instruction);
string generateRegdRegsMovRule(map<string, map<string, string>> dataForRegdRegsMovRule);
vector<string> generateLeftSideOperands(vector<string> operands);
vector<string> generateRightSideOperands(vector<string> operands);
string concatPseudoInstructions(string mnemonic, vector<string> mappedInstructions);
string formatRules(vector<string> rules, int maxIndexOfAssignOperator);
void writeRulesToFile(string filePath, string templatePath, string rulesString);
string concatVectorElements(vector<string> v, string delimiter);
vector<string> generateSyntacticSugarRules(unordered_map<string, string> opcodes);
string generateBinaryInstructionSyntacticSugarRule(const string& mnemonic, const string& destination, const string& operand1, const string& operand2);
string generateUnaryInstructionSyntacticSugarRule(const string& mnemonic, bool isImmediateInstruction, const string& destination, const string& operand);
string movIfNeeded(const string& destination, const string& source);
void removeEmptyStrings(vector<string>& v);
void replaceAll(string &str, const string &from, const string &to);

int main() {
  ifstream jsonFile("../docs/resources/data/instructionData.jsonc");
  json instructionsJsonArray = json::parse(jsonFile, nullptr, true, true)["instructions"];
  vector<string> rules;

  int maxIndexOfAssignOperator = -1;
  unordered_map<string, string> opcodes;

  for(int i = 0; i < instructionsJsonArray.size(); i++) {
    auto currentInstruction = instructionsJsonArray[i];
    string currentRule = generateRule(currentInstruction);
    int indexOfAssignOperator = currentRule.find("=>");
    maxIndexOfAssignOperator = max(indexOfAssignOperator, maxIndexOfAssignOperator);

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

  string rulesString = formatRules(rules, maxIndexOfAssignOperator);
  writeRulesToFile("rules.asm", "./rulesTemplate.asm", rulesString);

  return 0;
}

string generateRule(auto instruction) {
  vector<string> operands = instruction["operands"];
  string mnemonic = string(instruction["mnemonic"]);
  bool isInstructionReal = string(instruction["type"]) == "REAL";
  if(mnemonic == "mov") {
    return handleSpecialCaseMov(instruction);
  }

  vector<string> leftSideOperands = generateLeftSideOperands(operands);
  string rule = mnemonic + " " + concatVectorElements(leftSideOperands, ", ") + " => ";

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
  ifstream jsonFile("../docs/resources/data/movData.json");
  json movData = json::parse(jsonFile);
  string resultingRule = "";
  map<string, map<string, string>> dataForRegdRegsMovRule;

  for(int i = 0; i < movData.size(); i++) {
    auto currentData = movData[i];
    string opcode = currentData["opcode"];
    string sourceRegister = currentData["from"];
    string destinationRegister = currentData["to"];

    bool containsSourceRegister = std::find(std::begin(registers), std::end(registers), sourceRegister) != std::end(registers);
    bool containsDestinationRegister = std::find(std::begin(registers), std::end(registers), destinationRegister) != std::end(registers);
    if(containsSourceRegister && containsDestinationRegister) {
      //if the destination and source are of type "register", they'll be later added as part of a general mov rule for general registers
      dataForRegdRegsMovRule[destinationRegister][sourceRegister] = opcode;
      continue;
    }

    // else it's a special rule and it's handled separately (e.g. a mov from the Flags-Register)
    resultingRule += "mov " + destinationRegister + ", " + sourceRegister + " => 0b" + opcode;
    
    if(i < movData.size() - 1) {
      resultingRule += "\n";
    }
  }

  resultingRule += generateRegdRegsMovRule(dataForRegdRegsMovRule);
  return resultingRule;
}

//dataForRegdRegsMovRule is grouped by destination
string generateRegdRegsMovRule(map<string, map<string, string>> dataForRegdRegsMovRule) {
    string rule = format("\nmov {}, {} =>\n{{\n", REGISTER_ARGUMENT("regd"), string(REGISTER_ARGUMENT("regs")));
    rule += "\tregd == regs ? 0b00000000`8 : ; emit a nop so this instruction also becomes 4 bytes long and the assembler can choose the more specific rule with less bytes\n";

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

    for(int i = 0; i < operands.size(); i++) {
      string operand = operands[i];
      if(operand == "reg") leftSideOperands.push_back(REGISTER_ARGUMENT("reg"));
      else if(operand == "imm") leftSideOperands.push_back(IMMEDIATE_ARGUMENT("imm"));
      else if(operand == "addr") leftSideOperands.push_back(ADDRESS_ARGUMENT("addr"));
      else if(operand == "regd") leftSideOperands.push_back(REGISTER_ARGUMENT("regd"));
      else if(operand == "regs") leftSideOperands.push_back(REGISTER_ARGUMENT("regs"));
      else if(operand == "idxreg") leftSideOperands.push_back(INDXREGISTER_ARGUMENT("idxreg"));
      else if(operand == "lcdreg") leftSideOperands.push_back(LCDREGISTER_ARGUMENT("lcdreg"));
      else cerr << "No left side operands matching: " << operand << endl;
    }

    return leftSideOperands;
}

vector<string> generateRightSideOperands(vector<string> operands) {
    vector<string> rightSideOperands;

    for(int i = 0; i < operands.size(); i++) {
      string operand = operands[i];
      if(operand == "addr") rightSideOperands.push_back("le(addr)");
      else if(operand == "reg" || operand == "regd" || operand == "regs" || operand == "idxreg" || operand == "imm" || operand == "lcdreg") rightSideOperands.push_back(operand);
      else cerr << "No right side operands matching: " << operand << endl;
    }


    return rightSideOperands;
}

string concatPseudoInstructions(string mnemonic, vector<string> mappedInstructions) {
  string concattedString = "";
  if(mnemonic == "call") {  //handle special case call, in this representation of mnemonic, every mnemonic has a space behind its name
    concattedString = "asm{ \n";
    for(int i = 0; i < mappedInstructions.size(); i++) {
      concattedString += mappedInstructions[i] + "\n";
    }
    concattedString += "nextInstructionAddress: }";
    return concattedString;
  }

  for(int i = 0; i < mappedInstructions.size(); i++) {
    string currentInstruction = mappedInstructions[i];
    replaceAll(currentInstruction, "<", "{");  //replace argument brackets that exist in mapped instructions, customasm need curly braces for that
    replaceAll(currentInstruction, ">", "}");
    concattedString += "asm{ " + currentInstruction + " }";
    if(i != mappedInstructions.size() - 1) {
      concattedString += " @ ";
    }
  }

  return concattedString;
}

string formatRules(vector<string> rules, int maxIndexOfAssignOperator) {
  string formattedRulesString = "";

  int rulesSize = rules.size();
  for(int i = 0; i < rulesSize; i++) {
    string currentRule = rules.at(i);
    int indexOfAssignOperator = currentRule.find("=>");
    if(indexOfAssignOperator == string::npos) {
      formattedRulesString += "\t\t\t" + currentRule + "\n";
      continue;
    }
    while(indexOfAssignOperator < maxIndexOfAssignOperator + 1) {
      currentRule.insert(indexOfAssignOperator, " ");
      indexOfAssignOperator++;
    }
    formattedRulesString += "\t" + currentRule;
    if(i < rulesSize - 1) {
      formattedRulesString += "\n";
    }
  }

  return formattedRulesString;
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
  syntacticSugarRules.push_back("\n\n\n\n\n  ; Syntactic Sugar Rules:");
  syntacticSugarRules.push_back(format("ld {}, {}[{}] => asm{{ ldo {{reg}}, {{idxreg}}, {{addr}}  }} ", REGISTER_ARGUMENT("reg"), INDXREGISTER_ARGUMENT("idxreg"), ADDRESS_ARGUMENT("addr")));
  syntacticSugarRules.push_back(format("st {}, {}[{}] => asm{{ sto {{reg}}, {{idxreg}}, {{addr}}  }} ", REGISTER_ARGUMENT("reg"), INDXREGISTER_ARGUMENT("idxreg"), ADDRESS_ARGUMENT("addr")));
  
  syntacticSugarRules.push_back(format("ld {}, {}[SP] => asm{{ ldsprel {{reg}}, {{imm}} }} ", REGISTER_ARGUMENT("reg"), IMMEDIATE_ARGUMENT("imm")));
  syntacticSugarRules.push_back(format("st {}, {}[SP] => asm{{ stsprel {{reg}}, {{imm}} }} ", REGISTER_ARGUMENT("reg"), IMMEDIATE_ARGUMENT("imm")));

  syntacticSugarRules.push_back("jmp [A, TMP] => asm{ jmpr } ");
  syntacticSugarRules.push_back(format("jmp ({}) => asm{{ jmpind {{addr}} }}", ADDRESS_ARGUMENT("addr")));

  const string binaryALUInstructions[] = {"add", "addc", "sub", "subc", "and", "or", "xor"};
  const string unaryALUInstructions[] = {"addi", "addci", "subci", "andi", "ori", "xori", "not", "negate", "shl", "slr", "sar", "ror", "rol"};

  for(const string& mnemonic : binaryALUInstructions) {
    if(!mnemonic.starts_with("sub")) {
      syntacticSugarRules.push_back(format("{} {}, {}, {} => asm{{ mov A, {{reg2}} }} @ asm{{ mov TMP, {{reg3}} }} @ asm{{ {} }} @ asm{{ mov {{reg1}}, A }}", mnemonic, REGISTER_ARGUMENT("reg1"), REGISTER_ARGUMENT("reg2"), REGISTER_ARGUMENT("reg3"), mnemonic));
    }
    for(const string& destination : registers) {
      for(const string& operand1 : registers) {
        for(const string& operand2 : registers) {
          string rule = generateBinaryInstructionSyntacticSugarRule(mnemonic, destination, operand1, operand2);
          syntacticSugarRules.push_back(rule);
        }
      }
    }
  }

  for(const string& mnemonic : unaryALUInstructions) {
    const bool isImmediateInstruction = mnemonic.back() == 'i';
    if(isImmediateInstruction) {
      syntacticSugarRules.push_back(format("{} {}, {}, {} => asm{{ mov A, {{reg2}} }} @ asm{{ {} {{imm}} }} @ asm{{ mov {{reg1}}, A }}", mnemonic, REGISTER_ARGUMENT("reg1"), REGISTER_ARGUMENT("reg2"), IMMEDIATE_ARGUMENT("imm"), mnemonic));
    }  else {
      syntacticSugarRules.push_back(format("{} {}, {} => asm{{ mov A, {{reg2}} }} @ asm{{ {} }} @ asm{{ mov {{reg1}}, A }}", mnemonic, REGISTER_ARGUMENT("reg1"), REGISTER_ARGUMENT("reg2"), mnemonic));
    }

    for(const string& destination : registers) {
      for(const string& operand : registers) {
        string rule = generateUnaryInstructionSyntacticSugarRule(mnemonic, isImmediateInstruction, destination, operand);
        syntacticSugarRules.push_back(rule);
      }
    }
  }

  removeEmptyStrings(syntacticSugarRules);
  return syntacticSugarRules;
}

string generateBinaryInstructionSyntacticSugarRule(const string& mnemonic, const string& destination, const string& operand1, const string& operand2) {
  string rule = format("{} {}, {}, {} => ", mnemonic, destination, operand1, operand2); 
  vector<string> mappedInstructions;

  if(operand1 == "TMP" && operand2 == "A" && mnemonic.starts_with("sub")) {
      //swap two operands for sub
      mappedInstructions.push_back("asm{ mov BUF, A }");   // BUF = A
      mappedInstructions.push_back("asm{ mov A, TMP }");   // A = TMP
      mappedInstructions.push_back("asm{ mov TMP, BUF }"); // TMP = BUF
  } else {
    mappedInstructions.push_back(movIfNeeded("A", operand1));
    mappedInstructions.push_back(movIfNeeded("TMP", operand2));
  }

  mappedInstructions.push_back(format("asm{{ {} }}", mnemonic));
  mappedInstructions.push_back(movIfNeeded(destination, "A"));

  removeEmptyStrings(mappedInstructions);
  rule += concatVectorElements(mappedInstructions, " @ ");
  return mappedInstructions.size() == 4 ? "" : rule;
}

string generateUnaryInstructionSyntacticSugarRule(const string& mnemonic, bool isImmediateInstruction, const string& destination, const string& operand) {
  string rule;
  vector<string> mappedInstructions;

  if(isImmediateInstruction) {
    rule = format("{} {}, {}, {} => ", mnemonic, destination, operand, IMMEDIATE_ARGUMENT("imm"));
  }  else {
    rule = format("{} {}, {} => ", mnemonic, destination, operand);
  }
  
  mappedInstructions.push_back(movIfNeeded("A", operand));
  if(isImmediateInstruction) {
    mappedInstructions.push_back(format("asm{{ {} {{imm}} }}", mnemonic));
  } else {
    mappedInstructions.push_back(format("asm{{ {} }}", mnemonic));
  }
  mappedInstructions.push_back(movIfNeeded(destination, "A"));

  removeEmptyStrings(mappedInstructions);
  rule += concatVectorElements(mappedInstructions, " @ ");
  return mappedInstructions.size() == 3 ? "" : rule;
}

string movIfNeeded(const string& destination, const string& source) {
  return destination == source ? "" : format("asm{{ mov {}, {} }}", destination, source);
}

void removeEmptyStrings(vector<string>& v) {
  erase_if(v, [](const string& str) {return str.empty();});
}

void replaceAll(string &str, const string &from, const string &to) {
  int pos = 0;
  while ((pos = str.find(from, pos)) != string::npos) {
    str.replace(pos, from.length(), to);
    pos += to.length();
  }
}