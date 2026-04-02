#include <iostream>
#include <fstream>
#include <filesystem>
#include "../lib/json.hpp"
#include "./utils.cpp"

using json = nlohmann::json;
using namespace std;
namespace fs = std::filesystem;

json getJSONFromFile(string filePath);
void duplicateFile(string originalFilePath, string duplicatedFilePath);
string readFileContent(string filePath);
void writeFile(string filePath, string content);
void replaceAllInFile(string filePath, string from, string to);

json getJSONFromFile(string filePath) {
  ifstream jsonFile(filePath);
  return json::parse(jsonFile, nullptr, true, true);
}

void duplicateFile(string originalFilePath, string duplicatedFilePath) {
  if(fs::exists(duplicatedFilePath)) {
    fs::remove(duplicatedFilePath);
  }

  fs::copy_file(originalFilePath, duplicatedFilePath);
}

string readFileContent(string filePath) {
  ifstream file(filePath);
  string fileContent((istreambuf_iterator<char>(file)),istreambuf_iterator<char>());
  file.close();
  return fileContent;
}

void writeFile(string filePath, string content) {
  ofstream file(filePath);
  file.write(content.c_str(), content.length());
  file.close();
}

void replaceAllInFile(string filePath, string from, string to) {
  string fileContent = readFileContent(filePath);
  replaceAll(fileContent, from, to);
  writeFile(filePath, fileContent);
}