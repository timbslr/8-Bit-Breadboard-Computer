#pragma once
#include "string"
#include "vector"
using namespace std;

string concatVectorElements(vector<string> v, string delimiter);
string createBinString(vector<bool> binPieces);
void replaceAll(string& str, const string& from, const string& to);

string concatVectorElements(vector<string> v, string delimiter) {
  string result = "";
  for(int i = 0; i < v.size(); i++) {
    if(i != 0) result += delimiter;

    result += v[i];
  }
  return result;
}

string createBinString(vector<bool> binPieces) {
  if(binPieces.size() == 0) {
    return "";
  }

  string binString = "0b";
  for(bool b : binPieces) {
    binString += to_string(b);
  }

  return binString;
}

void replaceAll(string& str, const string& from, const string& to) {
  int pos = 0;
  while ((pos = str.find(from, pos)) != string::npos) {
    str.replace(pos, from.length(), to);
    pos += to.length();
  }
}

string repeat(string_view str, size_t count) {
  string result = "";
  result.reserve(str.size() * count);

  for(int i = 0; i < count; i++) {
    result += str;
  }

  return result;
}