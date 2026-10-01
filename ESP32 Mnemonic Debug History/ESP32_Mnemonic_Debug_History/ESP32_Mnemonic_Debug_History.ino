#include <Arduino.h>
#include "soc/gpio_struct.h"
#include <pgmspace.h>

// ============================================================
// PIN CONFIGURATION
// ============================================================

// Active-high STROBE.
// Rising edge = capture one opcode.
#define OPCODE_STROBE_PIN 15

// Active-high CLEAR.
// HIGH = clear/disable capture
// LOW  = capture
#define CLEAR_PIN 2


// ============================================================
// OPCODE BUS
// ============================================================
//
// Opcode bit       ESP32 GPIO
// ---------        ----------
// bit 0            GPIO16
// bit 1            GPIO17
// bit 2            GPIO18
// bit 3            GPIO19
// bit 4            GPIO21
// bit 5            GPIO22
// bit 6            GPIO23
// bit 7            GPIO4
//
// GPIO.in allows all eight bits to be sampled from one
// hardware register read.
// ============================================================

#define OPCODE_BIT0_GPIO 16
#define OPCODE_BIT1_GPIO 17
#define OPCODE_BIT2_GPIO 18
#define OPCODE_BIT3_GPIO 19
#define OPCODE_BIT4_GPIO 21
#define OPCODE_BIT5_GPIO 22
#define OPCODE_BIT6_GPIO 23
#define OPCODE_BIT7_GPIO 4


// ============================================================
// SERIAL
// ============================================================

#define BAUD_RATE 115200


// ============================================================
// CAPTURE BUFFER
// ============================================================

// One byte per opcode.
//
// 100,000 opcodes = 100 KB of RAM.
#define HISTORY_SIZE 100000


// ============================================================
// END-OF-CAPTURE DELAY
// ============================================================
//
// Capture continues regardless of opcode value.
//
// Once no STROBE has occurred for 100 ms, the history is
// considered complete and is dumped to Serial.
//

#define DUMP_DELAY_US 2000000UL


// ============================================================
// OPCODE MAP
// ============================================================

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
"addispu",
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
"subispu",
"ldsprelu ->A",
"ldsprelu ->TMP",
"ldsprelu ->B",
"ldsprelu ->C",
"ldsprelu ->X",
"ldsprelu ->Y",
"INVALID",
"INVALID",
"stsprelu ->A",
"stsprelu ->TMP",
"stsprelu ->B",
"stsprelu ->C",
"stsprelu ->X",
"stsprelu ->Y",
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
"pushi",
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


// ============================================================
// CAPTURE STORAGE
// ============================================================

volatile uint8_t opcodeHistory[HISTORY_SIZE];

volatile uint32_t historyIndex = 0;

volatile bool captureRunning = false;
volatile bool historyReady = false;

volatile uint32_t lastStrobeMicros = 0;


// ============================================================
// READ OPCODE
// ============================================================
//
// Read GPIO.in ONCE, then extract all eight opcode bits.
//
// This is much faster than calling digitalRead() eight times.
//

static inline uint8_t readOpcode()
{
  uint32_t g = GPIO.in;

  uint8_t opcode =
      (((g >> 16) & 1) << 0) |
      (((g >> 17) & 1) << 1) |
      (((g >> 18) & 1) << 2) |
      (((g >> 19) & 1) << 3) |
      (((g >> 21) & 1) << 4) |
      (((g >> 22) & 1) << 5) |
      (((g >> 23) & 1) << 6) |
      (((g >> 4)  & 1) << 7);

  return opcode;
}


// ============================================================
// STROBE INTERRUPT
// ============================================================
//
// One rising STROBE = one captured opcode.
//
// HLT (0x01) is NOT special.
// It is captured exactly like every other opcode.
//

void ARDUINO_ISR_ATTR captureOpcode()
{
  if (!captureRunning)
    return;

  // CLEAR is active HIGH.
  if (digitalRead(CLEAR_PIN))
    return;

  // Read entire opcode bus.
  uint8_t opcode = readOpcode();

  // Store opcode.
  if (historyIndex < HISTORY_SIZE)
  {
    opcodeHistory[historyIndex++] = opcode;

    // Reset the 100 ms inactivity timer.
    lastStrobeMicros = micros();
  }
  else
  {
    // Safety limit reached.
    captureRunning = false;
    historyReady = true;
  }
}


// ============================================================
// CLEAR HISTORY
// ============================================================

void clearHistory()
{
  noInterrupts();

  historyIndex = 0;
  historyReady = false;
  captureRunning = false;
  lastStrobeMicros = 0;

  interrupts();

  Serial.println();
  Serial.println("CLEAR: history erased.");
}


// ============================================================
// START CAPTURE
// ============================================================

void startCapture()
{
  noInterrupts();

  historyIndex = 0;
  historyReady = false;
  captureRunning = true;
  lastStrobeMicros = 0;

  interrupts();

  Serial.println();
  Serial.println("CAPTURE STARTED");
}


// ============================================================
// GET MNEMONIC FROM PROGMEM
// ============================================================

void printMnemonic(uint8_t opcode)
{
  char mnemonic[32];

  strncpy_P(
    mnemonic,
    opcodeMap[opcode],
    sizeof(mnemonic) - 1
  );

  mnemonic[sizeof(mnemonic) - 1] = '\0';

  Serial.print(mnemonic);
}


// ============================================================
// DUMP HISTORY
// ============================================================

void dumpHistory()
{
  noInterrupts();

  uint32_t count = historyIndex;

  historyReady = false;
  captureRunning = false;

  interrupts();


  Serial.println();
  Serial.println("========================================");
  Serial.println(" OPCODE HISTORY");
  Serial.println("========================================");

  Serial.print("Captured: ");
  Serial.print(count);
  Serial.println(" opcodes");

  Serial.println();


  for (uint32_t i = 0; i < count; i++)
  {
    uint8_t opcode = opcodeHistory[i];

    Serial.printf(
      "%06lu  %02X  ",
      (unsigned long)i,
      opcode
    );

    printMnemonic(opcode);

    Serial.println();
  }


  Serial.println();
  Serial.println("========================================");
  Serial.println(" END OF HISTORY");
  Serial.println("========================================");
  Serial.println();
}


// ============================================================
// SETUP
// ============================================================

void setup()
{
  Serial.begin(BAUD_RATE);

  // External logic already drives these signals.
  // No pull-up or pull-down is enabled.

  pinMode(OPCODE_STROBE_PIN, INPUT);
  pinMode(CLEAR_PIN, INPUT);


  historyIndex = 0;
  historyReady = false;
  lastStrobeMicros = 0;


  // Install STROBE interrupt.
  attachInterrupt(
    digitalPinToInterrupt(OPCODE_STROBE_PIN),
    captureOpcode,
    RISING
  );


  // If CLEAR is already LOW when the ESP32 starts,
  // immediately enter capture mode.
  if (!digitalRead(CLEAR_PIN))
  {
    captureRunning = true;
  }


  Serial.println();
  Serial.println("========================================");
  Serial.println(" ESP32 OPCODE LOGGER");
  Serial.println("========================================");
  Serial.println("STROBE : GPIO15");
  Serial.println("CLEAR  : GPIO2 (active HIGH)");
  Serial.println("BUS    : 16,17,18,19,21,22,23,4");
  Serial.println("BAUD   : 115200");
  Serial.println("BUFFER : 100000 opcodes");
  Serial.println("TIMEOUT: 100 ms");
  Serial.println();
}


// ============================================================
// MAIN LOOP
// ============================================================

void loop()
{
  static bool previousClear = digitalRead(CLEAR_PIN);

  bool clearActive = digitalRead(CLEAR_PIN);


  // ----------------------------------------------------------
  // CLEAR transitioned LOW -> HIGH
  // ----------------------------------------------------------
  //
  // Erase history and stop capture.
  //

  if (clearActive && !previousClear)
  {
    clearHistory();
  }


  // ----------------------------------------------------------
  // CLEAR transitioned HIGH -> LOW
  // ----------------------------------------------------------
  //
  // Begin a new capture.
  //

  if (!clearActive && previousClear)
  {
    startCapture();
  }


  previousClear = clearActive;


  // ----------------------------------------------------------
  // Check for 100 ms without STROBE
  // ----------------------------------------------------------

  if (captureRunning && historyIndex > 0)
  {
    uint32_t lastStrobe = lastStrobeMicros;

    if ((uint32_t)(micros() - lastStrobe) >= DUMP_DELAY_US)
    {
      noInterrupts();

      captureRunning = false;
      historyReady = true;

      interrupts();
    }
  }


  // ----------------------------------------------------------
  // Dump completed history
  // ----------------------------------------------------------

  if (historyReady)
  {
    dumpHistory();
  }
}