---
title: TMP-Register
layout: default
nav_order: 14
permalink: /modules/tmp-register
parent: Modules
---

<script type="module" src="../dist/PartList.js"></script>

## Temporary-Register (TMP)

The TMP-Register is an 8-bit register and is built the same as the A-Register. <br>
It uses two 4-bit register chips (SN74LS173AN) and a single 8-bit bus transceiver (SN74LS245N), which controls outputting data to the bus. <br>
Technically, the 4-bit register chips even have a three-state output, so an extra 8-bit bus transceiver wouldn't be necessary. But always enabling the output of the registers and controlling the output to the bus with the bus transceiver allows me to hook up LED's to the registers output and thus displaying their contents permanently, not only on outputting to the bus. <br>

An asynchronous input provides the ability to reset the registers to zero, the CLK-input provides a synchronization for loading data from the bus (on the rising CLK edge). On the other hand, outputting data from the register to the bus is asynchronous, as the bus transceiver outputs data immediately after it's Output Enable signal goes low. <br>

The TMP-Register's specialty is that it is the second operand of the ALU, which means whenever you want to computer a binary operation with the ALU, you have to store the second operand in this register. If you use an immediate-type ALU-instruction, the value of the immediate is first loaded into the TMP-Register. After that, the operation is executed.

{: .warning}
Be careful when storing values into the TMP-Register. It is meant for temporary values only and may be overwritten by many other instructions (e.g. immediate-type ALU-instructions). If you store values here, ensure they aren’t overwritten unexpectedly, so handle this register with care.
<br>
<part-list src="../resources/PartLists/TMP-Register.csv"></part-list>
<br>

### Schematic

<img src="../resources/Wiring Diagrams/TMP-Register.svg" alt="TMP-Register schematic" style="width:100%; height:auto;">
