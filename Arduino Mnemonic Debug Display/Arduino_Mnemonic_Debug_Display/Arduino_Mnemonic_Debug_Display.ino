#include <SPI.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 32

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire);

const int INSTRUCTION_REGISTER_PINS[] = {9, 8, 7, 6, 5, 4, 3, 2};
char buffer[32];

const char opcodeMap[256][32] PROGMEM = {
"nop",
"hlt",
"INVALID",
"s7sdum",
"INVALID",
"jmp",
"jmpr",
"ret",
"bzs",
"bzc",
"beq",
"bne",
"INVALID",
"INVALID",
"INVALID",
"INVALID",
"ld ->A",
"ld ->TMP",
"ld ->B",
"ld ->C",
"ld ->X",
"ld ->Y",
"INVALID",
"INVALID",
"st ->A",
"st ->TMP",
"st ->B",
"st ->C",
"st ->X",
"st ->Y",
"INVALID",
"INVALID",
"bcs",
"bcc",
"bltu",
"bgeu",
"addc",
"subc",
"jmpind",
"INVALID",
"out7sd ->A",
"out7sd ->TMP",
"out7sd ->B",
"out7sd ->C",
"out7sd ->X",
"out7sd ->Y",
"INVALID",
"out7sdi",
"ldo X ->A",
"ldo Y ->A",
"ldo X ->TMP",
"ldo Y ->TMP",
"ldo X ->B",
"ldo Y ->B",
"ldo X ->C",
"ldo Y ->C",
"ldo X ->X",
"ldo Y ->X",
"ldo X ->Y",
"ldo Y ->Y",
"INVALID",
"INVALID",
"INVALID",
"INVALID",
"sto X ->A",
"sto Y ->A",
"sto X ->TMP",
"sto Y ->TMP",
"sto X ->B",
"sto Y ->B",
"sto X ->C",
"sto Y ->C",
"sto X ->X",
"sto Y ->X",
"sto X ->Y",
"sto Y ->Y",
"INVALID",
"INVALID",
"INVALID",
"INVALID",
"ldsprel ->A",
"ldsprel ->TMP",
"ldsprel ->B",
"ldsprel ->C",
"ldsprel ->X",
"ldsprel ->Y",
"INVALID",
"INVALID",
"stsprel ->A",
"stsprel ->TMP",
"stsprel ->B",
"stsprel ->C",
"stsprel ->X",
"stsprel ->Y",
"INVALID",
"INVALID",
"bvs",
"bvc",
"INVALID",
"INVALID",
"incx",
"decx",
"incy",
"decy",
"li ->A",
"li ->TMP",
"li ->B",
"li ->C",
"li ->X",
"li ->Y",
"INVALID",
"INVALID",
"rxrd ->A",
"rxrd ->TMP",
"rxrd ->B",
"rxrd ->C",
"rxrd ->X",
"rxrd ->Y",
"INVALID",
"INVALID",
"txsend ->A",
"txsend ->TMP",
"txsend ->B",
"txsend ->C",
"txsend ->X",
"txsend ->Y",
"INVALID",
"txsendi",
"outlcd A->CTRL",
"outlcd TMP->CTRL",
"outlcd B->CTRL",
"outlcd C->CTRL",
"outlcd X->CTRL",
"outlcd Y->CTRL",
"lcdrda <imm> ->CTRL",
"outlcdi <imm> ->CTRL",
"outlcd A->DATA",
"outlcd TMP->DATA",
"outlcd B->DATA",
"outlcd C->DATA",
"outlcd X->DATA",
"outlcd Y->DATA",
"lcdrda <imm> ->DATA",
"outlcdi <imm> ->DATA",
"push ->A",
"push ->TMP",
"push ->B",
"push ->C",
"push ->X",
"push ->Y",
"blt",
"bge",
"mov A->TMP",
"mov A->B",
"mov A->C",
"mov A->X",
"mov A->Y",
"mov Y->A",
"mov F->A",
"INVALID",
"pop ->A",
"pop ->TMP",
"pop ->B",
"pop ->C",
"pop ->X",
"pop ->Y",
"ble",
"bgt",
"mov TMP->A",
"mov TMP->B",
"mov TMP->C",
"mov TMP->X",
"mov TMP->Y",
"mov Y->TMP",
"mov F->TMP",
"mov A->BUF",
"peek ->A",
"peek ->TMP",
"peek ->B",
"peek ->C",
"peek ->X",
"peek ->Y",
"INVALID",
"INVALID",
"mov B->A",
"mov B->TMP",
"mov B->C",
"mov B->X",
"mov B->Y",
"mov Y->B",
"mov F->B",
"mov BUF->TMP",
"bleu",
"bgtu",
"s7sdsm",
"add",
"slr",
"sub",
"INVALID",
"INVALID",
"mov C->A",
"mov C->TMP",
"mov C->B",
"mov C->X",
"mov C->Y",
"mov Y->C",
"mov F->C",
"INVALID",
"ldindr ->A",
"ldindr ->TMP",
"ldindr ->B",
"ldindr ->C",
"ldindr ->X",
"ldindr ->Y",
"INVALID",
"INVALID",
"mov X->A",
"mov X->TMP",
"mov X->B",
"mov X->C",
"mov X->Y",
"mov Y->X",
"mov F->X",
"INVALID",
"brxrdys",
"brxrdyc",
"and",
"or",
"not",
"INVALID",
"INVALID",
"INVALID",
"btxrdys",
"btxrdyc",
"INVALID",
"INVALID",
"INVALID",
"INVALID",
"mov F->Y",
"INVALID",
"sar",
"rol",
"shl",
"xor",
"ror",
"bns",
"bnc",
"INVALID",
"stindr ->A",
"stindr ->TMP",
"stindr ->B",
"stindr ->C",
"stindr ->X",
"stindr ->Y",
"INVALID",
"INVALID"
};

void setup() {
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.clearDisplay();
  display.setTextColor(WHITE);
  display.setTextSize(1);

  for(int pin : INSTRUCTION_REGISTER_PINS) {
    pinMode(pin, INPUT);
  }
}

void loop() {
  byte opcode = readByte();

  strncpy_P(buffer, opcodeMap[opcode], sizeof(buffer) - 1);
  buffer[sizeof(buffer) - 1] = '\0';

  display.clearDisplay();
  display.setCursor(0, 0);
  display.println(buffer);

  printOpcodeHex(opcode);
  printOpcodeBin(opcode);

  display.display();
}

byte readByte() {
  byte value = 0;
  for(int i=0; i<8; i++) {
    value |= digitalRead(INSTRUCTION_REGISTER_PINS[i]) << i;
  }
  return value;
}

void printOpcodeHex(byte opcode) {
  display.print("0x");
  if(opcode < 0x10) {
    display.print("0");
  }
  display.print(opcode, HEX);
}

void printOpcodeBin(byte opcode) {
  display.setCursor(display.width() - 8*9, display.getCursorY()); // 9 characters from the left => align opcode bin to the right
  for(int i=7; i>=0; i--) {
    display.print((opcode >> i) & 1);
    if(i == 4) {
      display.print("_");
    }
  }
  display.println();
}