---
title: Program Counter (PC)
layout: default
nav_order: 12
permalink: /modules/program-counter
parent: Modules
---

<script type="module" src="../dist/PartsList.js"></script>

## Program Counter (PC)

The Program Counter is a 16-bit register that holds the address for the next instruction. <br>
Every time an opcode or operand is fetched, the program counter is incremented in order to reference the next opcode or operand in memory.

It is also possible to load the program counter with values from the bus, which allows jumps (direct or conditional) to other memory locations.
<br>
<parts-list src="../resources/BOMs/PC.csv"></parts-list>
<br>

### Schematic

<img src="../resources/Wiring Diagrams/PC.svg" alt="Program-Counter schematic" style="width:100%; height:auto;">
