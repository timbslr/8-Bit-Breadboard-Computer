---
title: 7-Segment Display
layout: default
nav_order: 1
parent: Modules
---

## 7-Segment Display

The 7-Segment Display is the only module that I implemented the same as Ben Eater. Here's a description of how [his design](https://eater.net/8bit/output) works:

The number to be displayed is first loaded into the module's register. The register's output, which is exactly that number, is fed directly into a 16K EEPROM, which works as a decoder for the 7-segment display control pins.
According to the CAT28C16API's datasheet (the EEPROM I used), the chip has a total amount of 11 address lines, which serve as inputs in this design. Eight of these inputs are already used to represent the number to be displayed, leaving three bits for additional features.
<br>
One of these features is the multiplexing of the display's digits: The EEPROM has only eight I/O pins, meaning that no more than one digit can be controlled at once. In order to represent all possible numbers (-128 to 127), we need a minimum number of four digits on the display (one for the negative sign and three for any three-digit number).
The solution for displaying four digits simultaneously is multiplexing:
<br>
Only one of the four digits is active at the same time, but the module cycles through the digits so quickly, that the human eye recognizes it as if all digits were shown at the same time. In order to decode which of the 4 digits is active at the moment, the decoder/EEPROM needs an additional two bits. The last address bit available is used for switching the lookup-table between the normal decimal representation and a hexadecimal one.

Three chips of the module's schematic have not been described in the upper section yet.
The first one is a 555 timer chip, which controls the speed of the multiplexing, meaning how quickly it cycles through the digits.
The Dual J-K-Flip-Flop and the 2-to-4 line decoder control which digit is active at the moment by acting as a 2-bit binary counter and pulling the current digit's common cathode low.
<br>

In summary, the 555 timer allows the 2-bit counter to cycle so quickly through the digits, that the human eye does not recognize single digits put perceives a complete image instead. The EEPROM decodes this input along with the number to be displayed and the current representation bit (decimal or hexadecimal). The decoder then outputs the correct signals for the active digit, while the 2-to-4 line decoder enables the corresponding digit of the display.

<img src="../resources/Wiring Diagrams/7 Segment Display.svg" alt="7-Segment Display schematic" style="width:100%; height:auto;">
