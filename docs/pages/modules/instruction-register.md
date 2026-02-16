---
title: Instruction-Register (IR)
layout: default
nav_order: 9
permalink: /modules/instruction-register
parent: Modules
---

<script type="module" src="{{ site.baseurl }}/dist/PartList.js"></script>

## Instruction-Register (IR)

The Instruction-Register is built the same as the A-Register, but serves a completely different purpose. It's not used as a general-purpose register, instead it stores the opcode of the instruction that is currently executed. <br>
In that way, the controller, which is directly connected to the Instruction-Register, can select the corresponding microinstructions for the current instruction.
<br>
<part-list src="{{ site.baseurl }}/resources/PartLists/IR.csv"></part-list>
<br>

### Schematic

<img src="{{ site.baseurl }}/resources/Wiring Diagrams/IR.svg" alt="Instruction-Register schematic" style="width:100%; height:auto;">
