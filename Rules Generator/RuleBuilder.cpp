#include <sstream>
#include "../lib/utils.cpp"
using namespace std;

class RuleBuilder {
  ostringstream buffer;
  int currentIndentLevel = 0;
  static constexpr string_view INDENT_CHARACTER = "\t";
  size_t ASSIGN_OPERATOR_INDEX;

public:
  RuleBuilder(const size_t assignOperatorIndex = 0): ASSIGN_OPERATOR_INDEX(assignOperatorIndex) {}

  void openScope(string header = "") {
    indent(1);
    line(header + "{");
    indent(1);
  }

  void closeScope() {
    indent(-1);
    line("}");
    indent(-1);
  }

  void indent(int delta) {
    currentIndentLevel += delta;
    if(currentIndentLevel < 0) {
      currentIndentLevel = 0;
    }
  }

  void line(string_view lineContent){
    append(repeat(INDENT_CHARACTER, currentIndentLevel));
    endLine(lineContent);
  }

  void endLine(string_view lineContent = "") {
    append(lineContent);
    append("\n");
  }

  void append(string_view content) {
    buffer << content;
  }

  void ruleHeader(string_view leftSide, string_view rightSide) {
    string ruleHeader = format("{:<{}} => {}", leftSide, ASSIGN_OPERATOR_INDEX, rightSide);
    line(ruleHeader);
  }

  void partialRuleHeader(string_view leftSide) {
    string partialRuleHeader = format("{:<{}} => ", leftSide, ASSIGN_OPERATOR_INDEX);
    buffer << repeat(INDENT_CHARACTER, currentIndentLevel) << partialRuleHeader;
  }

  string build() {
    string result = buffer.str();
    if(!result.empty() && result.back() == '\n') {
      result.pop_back();  //remove last \n
    }
    buffer.str(""); // clear buffer
    buffer.clear(); // clear flags
    return result;
  }
};