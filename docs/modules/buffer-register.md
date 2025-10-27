---
title: Buffer-Register
layout: default
nav_order: 5
parent: Modules
---

## Buffer-Register

The Buffer-Register is built in the same way as the A-Register, but due to convention, it's not used as a general-purpose register. Instead, it is used when fetching an address operand from the memory if an opcode requires it. <br>
The problem is that the address is saved in two different bytes that have to be transferred from the memory output to the Memory-Address-Register in two steps (The address is stored in little-endian format, so the low byte is stored first, followed by the high byte). <br>
If you transferred the first byte of the address directly to MAR_L, this byte would be lost when the high byte is fetched in the following step and the program counter is loaded into the Memory-Address-Register once again. The solution is to store the low byte in the Buffer-Register first, and only load it into MAR_L after the high byte was fetched and transferred to MAR_H. In the end, the address is correctly placed in MAR for it's corresponding memory access.

<img src="../resources/Wiring Diagrams/Buffer-Register.svg" alt="Buffer-Register schematic" style="width:100%; height:auto;">
