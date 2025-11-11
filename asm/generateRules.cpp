#include <iostream>
#include <fstream>
#include "../lib/json.hpp"

using json = nlohmann::json;

#define REGISTER_ARGUMENT(specifier)  ("{" specifier ": register}") //uses string literal concatenation
#define LCDREGISTER_ARGUMENT(specifier)  ("{" specifier ": lcdregister}") //uses string literal concatenation
#define IMMEDIATE_ARGUMENT(specifier) ("{" specifier ": i8}")
#define ADDRESS_ARGUMENT(specifier)   ("{" specifier ": u16}")

const std::vector<std::string> rotateNMap = {
  std::string("ro?n ") + REGISTER_ARGUMENT("reg") + ", 0 => asm{ }",
  std::string("ro?n ") + REGISTER_ARGUMENT("reg") + ", 1 => asm{ ro? {reg} }",
  std::string("ro?n ") + REGISTER_ARGUMENT("reg") + ", 2 => asm{ ro? A } @ asm{ ro? {reg} }",
  std::string("ro?n ") + REGISTER_ARGUMENT("reg") + ", 3 => asm{ ro? A } @ asm{ ro? A } @ asm{ ro? {reg} }",
  std::string("ro?n ") + REGISTER_ARGUMENT("reg") + ", 4 => asm{ ro? A } @ asm{ ro? A } @ asm{ ro? A } @ asm{ ro? {reg} }",
  std::string("ro?n ") + REGISTER_ARGUMENT("reg") + ", 5 => asm{ ro! A } @ asm{ ro! A } @ asm{ ro! {reg} }",
  std::string("ro?n ") + REGISTER_ARGUMENT("reg") + ", 6 => asm{ ro! A } @ asm{ ro! {reg} }",
  std::string("ro?n ") + REGISTER_ARGUMENT("reg") + ", 7 => asm{ ro! {reg} }", 
};

std::string generateRule(auto instruction);
std::string concatPseudoInstructions(std::vector<std::string> mappedInstructions);
std::string handleSpecialCaseRotateN(auto instruction, bool isrorn);
std::string handleSpecialCaseMovs(auto instruction);
void replaceAll(std::string &str, const std::string &from, const std::string &to);

int main() {
  std::ifstream jsonFile("../docs/resources/data/instructionData.json");
  json instructionsJsonArray = json::parse(jsonFile)["instructions"];
  std::vector<std::string> rules;

  int maxIndexOfAssignOperator = -1;
  for(int i = 0; i < instructionsJsonArray.size(); i++) {
    auto currentInstruction = instructionsJsonArray[i];
    std::string currentRule = generateRule(currentInstruction);
    int indexOfAssignOperator = currentRule.find("=>");
    if(maxIndexOfAssignOperator < indexOfAssignOperator) {
      maxIndexOfAssignOperator = indexOfAssignOperator;
    }

    if(currentInstruction.contains("opcode")) {
      std::string opcode = currentInstruction["opcode"];
      replaceAll(opcode, "R", "");
      replaceAll(opcode, "L", "");
      replaceAll(currentRule, "<opcode>", opcode);
    }

    std::stringstream ss(currentRule);
    std::string singleRuleString;
    while(std::getline(ss, singleRuleString, '\n')) { //split at \n for rorn and roln
      rules.push_back(singleRuleString);
    }
  }

  //Format rules
  std::string rulesString = "";
  int rulesSize = rules.size();
  for(int i = 0; i < rulesSize; i++) {
    std::string currentRule = rules.at(i);
    int indexOfAssignOperator = currentRule.find("=>");
    while(indexOfAssignOperator < maxIndexOfAssignOperator + 1) {
      currentRule.insert(indexOfAssignOperator, " ");
      indexOfAssignOperator++;
    }
    rulesString += "\t" + currentRule;
    if(i < rulesSize - 1) {
      rulesString += "\n";
    }
  }

  std::ifstream templateFile("./rulesTemplate.asm");
  std::string fileContent((std::istreambuf_iterator<char>(templateFile)),std::istreambuf_iterator<char>());
  replaceAll(fileContent, "\t<RULES>", rulesString);

  std::ofstream outputFileStream("rules.asm");
  outputFileStream.write(fileContent.c_str(), fileContent.length());
  outputFileStream.close();
  return 0;
}

std::string generateRule(auto instruction) {
  std::vector<std::string> operands = instruction["operands"];
  std::string mnemonic = std::string(instruction["mnemonic"]) + " "; //theres always a space behind the mnemonic, so you can already insert it here 
  bool isInstructionReal = std::string(instruction["type"]) == "REAL";
  if(mnemonic == "rorn ") {
    return handleSpecialCaseRotateN(instruction, true);
  } else if(mnemonic == "roln ") {
    return handleSpecialCaseRotateN(instruction, false);
  } else if(mnemonic == "movs ") {
    return handleSpecialCaseMovs(instruction);
  }

  if(isInstructionReal) {
    switch(operands.size()) {
      case 0: { //no operands => simply map to opcode
        return mnemonic + "=> 0b<opcode>";  //<opcode> will be replaced later with the actual opcode 
      }
      case 1: {
        if(operands[0] == "reg") {
          return mnemonic + REGISTER_ARGUMENT("reg") + " => 0b<opcode> @ reg";
        }
        if(operands[0] == "imm") {
          return mnemonic + IMMEDIATE_ARGUMENT("imm") + " => 0b<opcode> @ imm";
        }
        if(operands[0] == "addr") {
          return mnemonic + ADDRESS_ARGUMENT("addr") + " => 0b<opcode> @ le(addr)";
        }
        std::cerr << "No operands matched for operand count 1: " << operands[0] << std::endl;
        break;
      }
      case 2: {
        if(operands[0] == "reg" && operands[1] == "imm") {
          return mnemonic + REGISTER_ARGUMENT("reg") + ", " + IMMEDIATE_ARGUMENT("imm") + " => 0b<opcode> @ reg @ imm";
        }
        if(operands[0] == "regd" && operands[1] == "regs") {
          return mnemonic + REGISTER_ARGUMENT("regd") + ", " + REGISTER_ARGUMENT("regs") + " => 0b<opcode> @ regs @ regd";
        }
        if(operands[0] == "reg" && operands[1] == "addr") {
          return mnemonic + REGISTER_ARGUMENT("reg") + ", " + ADDRESS_ARGUMENT("addr") + " => 0b<opcode> @ reg @ le(addr)";
        }
        if(operands[0] == "imm" && operands[1] == "addr") {
          return mnemonic + IMMEDIATE_ARGUMENT("imm") + ", " + ADDRESS_ARGUMENT("addr") + " => 0b<opcode> @ imm @ le(addr)";
        }
        if(operands[0] == "lcdreg" && operands[1] == "reg") {
          return mnemonic + LCDREGISTER_ARGUMENT("lcdreg") + ", " + REGISTER_ARGUMENT("reg") + " => 0b<opcode> @ lcdreg @ reg";
        }
        if(operands[0] == "lcdreg" && operands[1] == "imm") {
          return mnemonic + LCDREGISTER_ARGUMENT("lcdreg") + ", " + IMMEDIATE_ARGUMENT("imm") + " => 0b<opcode> @ lcdreg @ imm";
        }
        std::cerr << "No operands matched for operand count 2: " << operands[0] << " " << operands[1] << std::endl;
        break;
      }
    };
  } else {
    std::vector<std::string> mappedInstructions = instruction["mappedInstructions"];
    switch(operands.size()) {
      case 0: {
        return mnemonic + " => " + concatPseudoInstructions(mappedInstructions);
      }
      case 1: {
        if(operands[0] == "reg") {
          return mnemonic + REGISTER_ARGUMENT("reg") + " => " + concatPseudoInstructions(mappedInstructions);
        }
        if(operands[0] == "addr") {
          return mnemonic + ADDRESS_ARGUMENT("addr") + " => " + concatPseudoInstructions(mappedInstructions);
        }
        break;
      }
      case 2: {
        if(operands[0] == "reg" && operands[1] == "imm") {
          return mnemonic + REGISTER_ARGUMENT("reg") + ", " + IMMEDIATE_ARGUMENT("imm") + " => " + concatPseudoInstructions(mappedInstructions);
        }
        if(operands[0] == "imm" && operands[1] == "addr") {
          return mnemonic + IMMEDIATE_ARGUMENT("imm") + ", " + ADDRESS_ARGUMENT("addr") + " => " + concatPseudoInstructions(mappedInstructions);
        }
        break;
      }
    };
  }

  std::cerr << "Not able to generate customasm-rule for instruction: " + mnemonic << std::endl;
  return "ERROR";
}

std::string concatPseudoInstructions(std::vector<std::string> mappedInstructions) {
  std::string concattedString = "";

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

//optimization that was performed here: 
//if n is greater than 4, rorn executes rol (8-n) times, the same happens with roln
std::string handleSpecialCaseRotateN(auto instruction, bool isrorn) {
  std::vector<std::string> rotateNMapCopy = rotateNMap;
  std::string resultingRule = "";

  //start from 1 as rorn <reg>, 0 and roln <reg>, 0 are useless
  for(int i = 1; i < rotateNMap.size(); i++) {
    std::string currentMapElement = rotateNMapCopy[i];
    replaceAll(currentMapElement, "?", isrorn ? "r" : "l");
    replaceAll(currentMapElement, "!", isrorn ? "l" : "r");

    resultingRule += currentMapElement;
    if(i < rotateNMap.size() - 1) {
      resultingRule += "\n";
    }
  }

  return resultingRule;
}

std::string handleSpecialCaseMovs(auto instruction) {
  std::ifstream jsonFile("../docs/resources/data/movsData.json");
  json movsData = json::parse(jsonFile);
  std::string resultingRule = "";
  std::string firstNibble = instruction["opcode"];
  replaceAll(firstNibble, "R", "");

  for(int i = 0; i < movsData.size(); i++) {
    auto currentData = movsData[i];
    std::string secondNibble = currentData["secondNibble"];
    std::string sourceRegister = currentData["from"];
    if(sourceRegister == "T") sourceRegister = "TMP";
    std::string destinationRegister = currentData["to"];
    if(destinationRegister == "T") destinationRegister = "TMP";

    resultingRule += "movs " + destinationRegister + ", " + sourceRegister + " => 0b" + firstNibble + secondNibble;
    
    if(i < movsData.size() - 1) {
      resultingRule += "\n";
    }
  }

  return resultingRule;
}

void replaceAll(std::string &str, const std::string &from, const std::string &to) {
  int pos = 0;
  while ((pos = str.find(from, pos)) != std::string::npos) {
    str.replace(pos, from.length(), to);
    pos += to.length();
  }
}