#include <iostream>
#include <fstream>
#include <format>
#include "../lib/json.hpp"

using json = nlohmann::json;

#define REGISTER_ARGUMENT(specifier)  ("{" specifier ": register}")
#define LCDREGISTER_ARGUMENT(specifier)  ("{" specifier ": lcdregister}")
#define INDXREGISTER_ARGUMENT(specifier) (("{" specifier ": idxregister}"))
#define IMMEDIATE_ARGUMENT(specifier) ("{" specifier ": i8}")
#define ADDRESS_ARGUMENT(specifier)   ("{" specifier ": u16}")

std::string generateRule(auto instruction);
std::string handleSpecialCaseMov(auto instruction);
std::vector<std::string> generateLeftSideOperands(std::vector<std::string> operands);
std::vector<std::string> generateRightSideOperands(std::vector<std::string> operands);
std::string concatPseudoInstructions(std::string mnemonic, std::vector<std::string> mappedInstructions);
std::string formatRules(std::vector<std::string> rules, int maxIndexOfAssignOperator);
void writeRulesToFile(std::string filePath, std::string templatePath, std::string rulesString);
std::string concatVectorElements(std::vector<std::string> v, std::string delimiter);
std::vector<std::string> generateSyntacticSugarRules(std::unordered_map<std::string, std::string> opcodes);
void replaceAll(std::string &str, const std::string &from, const std::string &to);

int main() {
  std::ifstream jsonFile("../docs/resources/data/instructionData.jsonc");
  json instructionsJsonArray = json::parse(jsonFile, nullptr, true, true)["instructions"];
  std::vector<std::string> rules;

  int maxIndexOfAssignOperator = -1;
  std::unordered_map<std::string, std::string> opcodes;

  for(int i = 0; i < instructionsJsonArray.size(); i++) {
    auto currentInstruction = instructionsJsonArray[i];
    std::string currentRule = generateRule(currentInstruction);
    int indexOfAssignOperator = currentRule.find("=>");
    maxIndexOfAssignOperator = std::max(indexOfAssignOperator, maxIndexOfAssignOperator);

    if(currentInstruction.contains("opcode")) {
      std::string opcode = currentInstruction["opcode"];
      replaceAll(opcode, "R", "");
      replaceAll(opcode, "L", "");
      replaceAll(opcode, "X", "");
      replaceAll(currentRule, "<opcode>", opcode);
      opcodes[currentInstruction["mnemonic"]] = opcode;
    }

    std::stringstream ss(currentRule);
    std::string singleRuleString;
    while(std::getline(ss, singleRuleString, '\n')) {
      rules.push_back(singleRuleString);
    }
  }

  std::vector<std::string> syntacticSugarRules = generateSyntacticSugarRules(opcodes);
  rules.insert(rules.end(), syntacticSugarRules.begin(), syntacticSugarRules.end());

  std::string rulesString = formatRules(rules, maxIndexOfAssignOperator);
  writeRulesToFile("rules.asm", "./rulesTemplate.asm", rulesString);

  return 0;
}

std::string generateRule(auto instruction) {
  std::vector<std::string> operands = instruction["operands"];
  std::string mnemonic = std::string(instruction["mnemonic"]);
  bool isInstructionReal = std::string(instruction["type"]) == "REAL";
  if(mnemonic == "mov") {
    return handleSpecialCaseMov(instruction);
  }

  std::vector<std::string> leftSideOperands = generateLeftSideOperands(operands);
  std::string rule = mnemonic + " " + concatVectorElements(leftSideOperands, ", ") + " => ";

  if(isInstructionReal) {
    rule += "0b<opcode>";

    if(operands.size() == 0) return rule;

    std::vector<std::string> rightSideOperands = generateRightSideOperands(operands);
    rule += " @ " + concatVectorElements(rightSideOperands, " @ ");;
    return rule;
  }

  std::vector<std::string> mappedInstructions = instruction["mappedInstructions"];
  rule += concatPseudoInstructions(mnemonic, mappedInstructions);

  return rule;
}

std::string handleSpecialCaseMov(auto instruction) {
  std::ifstream jsonFile("../docs/resources/data/movData.json");
  json movData = json::parse(jsonFile);
  std::string resultingRule = "";

  for(int i = 0; i < movData.size(); i++) {
    auto currentData = movData[i];
    std::string opcode = currentData["opcode"];
    std::string sourceRegister = currentData["from"];
    std::string destinationRegister = currentData["to"];

    resultingRule += "mov " + destinationRegister + ", " + sourceRegister + " => 0b" + opcode;
    
    if(i < movData.size() - 1) {
      resultingRule += "\n";
    }
  }

  return resultingRule;
}

std::vector<std::string> generateLeftSideOperands(std::vector<std::string> operands) {
    std::vector<std::string> leftSideOperands;

    for(int i = 0; i < operands.size(); i++) {
      std::string operand = operands[i];
      if(operand == "reg") leftSideOperands.push_back(REGISTER_ARGUMENT("reg"));
      else if(operand == "imm") leftSideOperands.push_back(IMMEDIATE_ARGUMENT("imm"));
      else if(operand == "addr") leftSideOperands.push_back(ADDRESS_ARGUMENT("addr"));
      else if(operand == "regd") leftSideOperands.push_back(REGISTER_ARGUMENT("regd"));
      else if(operand == "regs") leftSideOperands.push_back(REGISTER_ARGUMENT("regs"));
      else if(operand == "idxreg") leftSideOperands.push_back(INDXREGISTER_ARGUMENT("idxreg"));
      else if(operand == "lcdreg") leftSideOperands.push_back(LCDREGISTER_ARGUMENT("lcdreg"));
      else std::cerr << "No left side operands matching: " << operand << std::endl;
    }

    return leftSideOperands;
}

std::vector<std::string> generateRightSideOperands(std::vector<std::string> operands) {
    std::vector<std::string> rightSideOperands;

    for(int i = 0; i < operands.size(); i++) {
      std::string operand = operands[i];
      if(operand == "addr") rightSideOperands.push_back("le(addr)");
      else if(operand == "reg" || operand == "regd" || operand == "regs" || operand == "idxreg" || operand == "imm" || operand == "lcdreg") rightSideOperands.push_back(operand);
      else std::cerr << "No right side operands matching: " << operand << std::endl;
    }


    return rightSideOperands;
}

std::string concatPseudoInstructions(std::string mnemonic, std::vector<std::string> mappedInstructions) {
  std::string concattedString = "";
  if(mnemonic == "call") {  //handle special case call, in this representation of mnemonic, every mnemonic has a space behind its name
    concattedString = "asm{ \n";
    for(int i = 0; i < mappedInstructions.size(); i++) {
      concattedString += mappedInstructions[i] + "\n";
    }
    concattedString += "nextInstructionAddress: }";
    return concattedString;
  }

  for(int i = 0; i < mappedInstructions.size(); i++) {
    std::string currentInstruction = mappedInstructions[i];
    replaceAll(currentInstruction, "<", "{");  //replace argument brackets that exist in mapped instructions, customasm need curly braces for that
    replaceAll(currentInstruction, ">", "}");
    concattedString += "asm{ " + currentInstruction + " }";
    if(i != mappedInstructions.size() - 1) {
      concattedString += " @ ";
    }
  }

  return concattedString;
}

std::string formatRules(std::vector<std::string> rules, int maxIndexOfAssignOperator) {
  std::string formattedRulesString = "";

  int rulesSize = rules.size();
  for(int i = 0; i < rulesSize; i++) {
    std::string currentRule = rules.at(i);
    int indexOfAssignOperator = currentRule.find("=>");
    if(indexOfAssignOperator == std::string::npos) {
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

void writeRulesToFile(std::string filePath, std::string templatePath, std::string rulesString) {
  std::ifstream templateFile(templatePath);
  std::string fileContent((std::istreambuf_iterator<char>(templateFile)),std::istreambuf_iterator<char>());
  replaceAll(fileContent, "\t<RULES>", rulesString);

  std::ofstream outputFileStream(filePath);
  outputFileStream.write(fileContent.c_str(), fileContent.length());
  outputFileStream.close();
}

std::string concatVectorElements(std::vector<std::string> v, std::string delimiter) {
  std::string result = "";
  for(int i = 0; i < v.size(); i++) {
    if(i != 0) result += delimiter;

    result += v[i];
  }
  return result;
}

std::vector<std::string> generateSyntacticSugarRules(std::unordered_map<std::string, std::string> opcodes) {
  std::vector<std::string> syntacticSugarRules;
  //syntacticSugarRules.push_back("\n  ; Syntactic Sugar Rules:");
  syntacticSugarRules.push_back(std::format("ld {}, {}[{}] => asm{{ ldo {{reg}}, {{idxreg}}, {{addr}}  }} ", REGISTER_ARGUMENT("reg"), INDXREGISTER_ARGUMENT("idxreg"), ADDRESS_ARGUMENT("addr")));
  syntacticSugarRules.push_back(std::format("st {}, {}[{}] => asm{{ sto {{reg}}, {{idxreg}}, {{addr}}  }} ", REGISTER_ARGUMENT("reg"), INDXREGISTER_ARGUMENT("idxreg"), ADDRESS_ARGUMENT("addr")));
  
  syntacticSugarRules.push_back(std::format("ld {}, {}[SP] => asm{{ ldsprel {{reg}}, {{imm}} }} ", REGISTER_ARGUMENT("reg"), IMMEDIATE_ARGUMENT("imm")));
  syntacticSugarRules.push_back(std::format("st {}, {}[SP] => asm{{ stsprel {{reg}}, {{imm}} }} ", REGISTER_ARGUMENT("reg"), IMMEDIATE_ARGUMENT("imm")));

  syntacticSugarRules.push_back("jmp [A, TMP] => asm{ jmpr } ");
  syntacticSugarRules.push_back(std::format("jmp ({}) => asm{{ jmpind {{addr}} }}", ADDRESS_ARGUMENT("addr")));

  return syntacticSugarRules;
}


void replaceAll(std::string &str, const std::string &from, const std::string &to) {
  int pos = 0;
  while ((pos = str.find(from, pos)) != std::string::npos) {
    str.replace(pos, from.length(), to);
    pos += to.length();
  }
}