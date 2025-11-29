---
title: Memory-Address-Register (MAR)
layout: default
nav_order: 10
parent: Modules
---

<script type="module" src="../scripts/PartsList.js"></script>

## Memory-Address-Register (MAR)

If you take a look at the memory-module, you can see that it has a 16-bit address input. The problem is that the bus is only 8-bit wide, which would only allow 8 address input bits at once. <br>
The Memory Address Register (16 Bit) solves that problem by storing the full address first before fetching the data from memory. It allows any component which wants to fetch data from memory to transfer the memory address in two separate 8-bit pieces over the bus into the MAR. <br>
After that, the full 16-bit address is ready to be used for a memory access.

The most significant bit has an additional role in memory access: It controls whether the ROM (msb = 0) or RAM (msb = 1) is accessed by enabling one of the two and disabling the other.
<br>
<parts-list src="../resources/BOMs/MAR.csv"></parts-list>
<br>

### Schematic

<img src="../resources/Wiring Diagrams/MAR.svg" alt="MAR schematic" style="width:100%; height:auto;">
